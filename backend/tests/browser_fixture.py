"""Scoped fixture support for the opt-in browser test; never enables a production bypass."""
import asyncio
import json
import re
import sys

from sqlalchemy import delete, select, text
from sqlalchemy.dialects.postgresql import insert

from app.core.config import get_settings
from app.core.event_loop import new_event_loop
from app.db.session import get_engine, get_session_factory
from app.models.catalog import Banner, Category, Product
from app.models.media import Media
from app.models.profile import Profile
from app.services.storage import storage_call


async def fixture(action, email):
    assert re.fullmatch(r"phase3-browser-[a-f0-9]+@example\.invalid", email)
    assert "ep-summer-shadow-b4c3cmqi" in (get_settings().database_url or ""), "Development branch only"
    prefix = email.split("@")[0]
    async with get_session_factory()() as session:
        identifier = await session.scalar(text('SELECT id FROM neon_auth."user" WHERE email = :email'), {"email": email})
        if not identifier:
            print(json.dumps({"id": None}))
            return
        identifier = str(identifier)
        if action == "setup":
            await session.execute(text('UPDATE neon_auth."user" SET "emailVerified" = true WHERE email = :email'), {"email": email})
            await session.execute(insert(Profile).values(id=identifier, email=email, name="Browser QA", role="admin")
                                  .on_conflict_do_nothing(index_elements=[Profile.id]))
        elif action == "cleanup":
            for model, column in ((Product, Product.slug), (Banner, Banner.title), (Category, Category.slug)):
                await session.execute(delete(model).where(column.startswith(prefix)))
            await session.commit()
            media = (await session.scalars(select(Media).where(Media.owner_id == identifier))).all()
            for image in media:
                for key in (image.object_key, f"pending/{image.object_key}"):
                    await storage_call("delete_object", Bucket=get_settings().catalog_bucket, Key=key)
                await session.delete(image)
            await session.execute(delete(Profile).where(Profile.id == identifier))
        else:
            raise ValueError("Unknown fixture command")
        await session.commit()
        print(json.dumps({"id": identifier}))
    await get_engine().dispose()


if __name__ == "__main__":
    asyncio.run(fixture(*sys.argv[1:]), loop_factory=new_event_loop)
