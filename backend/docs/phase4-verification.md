# Phase 4 backend verification — updated November 18, 2026

## Passed

- `python -m alembic upgrade head`: applied through `0004_commerce` on the new
  `phase4-backend` development branch, after confirming connectivity.
- `python -m alembic check`: no new upgrade operations detected.
- `python -m pytest tests/test_auth.py tests/test_health.py tests/test_catalog.py tests/test_commerce_contract.py`:
  37 tests, exit 0, 100%.
- `RUN_COMMERCE_DB_TESTS=1 python -m pytest tests/test_commerce_orders.py`:
  6 passed in 434.23 seconds.
- `RUN_COMMERCE_DB_TESTS=1 python -m pytest tests/test_commerce_payments.py`:
  9 tests, exit 0, 100%.
- `RUN_COMMERCE_DB_TESTS=1 python -m pytest tests/test_payment_exceptions.py`:
  1 test, exit 0, 100%.
- `python -m compileall -q app tests` and `git diff --check`: exit 0.

These 53 passing checks cover shared product stock, concurrent last-item
reservations, uniform shipping, quote expiry and changed prices, owned orders,
idempotency, cancellation/expiry, stock edit/delete guards, immutable snapshots,
signed webhooks, invalid signatures/timestamps/accounts, duplicate events and
charges, late failures, underpayments, late payment, and reconciliation.

## Real Bachs sandbox evidence

- Supplied sandbox key accepted by the official CLI and asynchronous Python SDK.
- Account API returned `200`, matching the configured organization ID and
  `fee_handling=account_pays_fee`.
- Hosted NGN checkout created with status `open` and an expiry timestamp.
- Real order API smoke test created a hosted session, replayed the same request
  idempotently, and retrieved the matching checkout/reference/NGN amount from
  Bachs. All these assertions passed, but a Unicode arrow in its success print
  raised a Windows console encoding error. The message is now plain ASCII.
- Official CLI forwarding delivered a provider-signed `collection.succeeded`
  sample to local FastAPI. Signature and account validation accepted it; the
  endpoint returned `503 WEBHOOK_ATTEMPT_NOT_READY` for the sample's unmatched
  application reference. No unrelated order was marked paid.

## November 18 follow-up

The original Neon development branch is still ready and its database connection
is working again. The focused real-sandbox test was rerun successfully:

```powershell
$env:RUN_COMMERCE_DB_TESTS='1'
$env:RUN_BACHS_SANDBOX_TESTS='1'
.venv/Scripts/python.exe -m pytest tests/test_bachs_live.py -x -s
```

Output: `Real sandbox: API order, Bachs session, verified lookup and idempotent
replay passed`, followed by `1 passed in 33.65s`. Combined with the earlier
checks, 54 tests have passing results. Broad suites were not repeated.

Both abandoned disposable schemas were removed successfully on November 18:
`commerce_test_db523d91c76c4d96a16ff763f93a55e4` and
`commerce_test_7f115ca961e54280ab12e324fa969e62`. Public application tables were
not modified. The successful focused test removed its own disposable schema.

## Completed matching sandbox payment

On November 18 the user completed a simulated payment on Bachs's hosted sandbox
checkout for an isolated temporary order totalling NGN 5,100.50. An official CLI
forwarding session delivered its actual provider-signed `collection.succeeded`
event to FastAPI. The endpoint returned `200`.

The API-only harness verified:

- order state: `paid`;
- product stock: 2 before payment, 1 after payment;
- recorded charge count: 1;
- payment review reason: null.

Command: `$env:PYTHONPATH='.;tests'; .venv/Scripts/python.exe .venv/verify_matched_payment.py`
Output: `PASS: provider-signed matched payment marked order paid and consumed
stock once.` Then `Disposable payment schema removed; local API stopped.`
The temporary harness lives under ignored `.venv/`, not the application codebase.
Its synthetic identity/dependency overrides were isolated to that local test
process. Existing identity/JWT/permission regression tests remain separate from
this provider transport check. No customer inbox, real card or real money was used.

Phase 4's outstanding connection, cleanup and matching-payment checks are now
complete. Production webhook registration and production activation remain
Phase 6. The local listener was stopped; replace its session-specific secret on
the next local forwarding run.

There were no frontend edits, generated frontend types, FM LUXE browser tests,
Next.js builds, manual-transfer implementation, real charges, payouts, refunds
or deployment in this phase. The user interacted only with Bachs's existing
hosted sandbox checkout. Application public tables contain no test products.
The previous frontend environment is unchanged. Production was not modified.
