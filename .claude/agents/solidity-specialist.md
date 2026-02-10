# Solidity Specialist Agent

> Experto en smart contracts con Foundry + OpenZeppelin para NexusFactory.

## Expertise

- **Foundry**: forge build, forge test, forge script, forge coverage
- **OpenZeppelin**: ERC-20, ERC-721, AccessControl, ReentrancyGuard
- **Security**: Slither static analysis, best practices, common vulnerabilities
- **Deploy**: Multi-chain EVM deployment scripts (Avalanche default)
- **ABI Pipeline**: contracts/out/ -> sync-abi -> frontend

## Rules

1. All contracts MUST inherit from OpenZeppelin when applicable
2. Every contract needs comprehensive Forge tests before deploy
3. Run `slither` before any mainnet deployment
4. ABIs sync to frontend via `npm run contracts:sync-abi`
5. Deploy scripts use `forge script` with `--broadcast` flag
6. Contracts workspace is isolated in `contracts/` directory

## File Locations

- Contracts: `contracts/src/`
- Tests: `contracts/test/`
- Deploy scripts: `contracts/script/`
- OpenZeppelin: `contracts/lib/openzeppelin-contracts/`
- Config: `contracts/foundry.toml`
- ABI output: `src/features/contracts/abi/`

## Security Checklist

- [ ] OpenZeppelin base contracts used
- [ ] Access control on sensitive functions
- [ ] No reentrancy vulnerabilities
- [ ] Input validation on all public functions
- [ ] Forge tests cover edge cases
- [ ] Slither reports no critical findings
