[![Mentioned in Awesome Foundry](https://awesome.re/mentioned-badge-flat.svg)](https://github.com/crisgarner/awesome-foundry)

# Foundry + Hardhat Diamond Factory Template

This is a factory diamond contract template for [Diamonds](https://eips.ethereum.org/EIPS/eip-2535) which allows for the creation of upgradeable factory contracts!

## Installation

- Clone this repo
- Install dependencies

```bash
$ yarn && forge update
```

### Compile

```bash
$ npx hardhat compile
```

## Deployment

### Hardhat

```bash
$ npx hardhat run scripts/deploy.js
```

### Foundry

```bash
$ forge t
```

`Make file`: Deployment commands for foundry projects can be found in the Makefile.

Foundry was used for testing, deployment and verification.

`Note`: A lot of improvements are still needed so contributions are welcome!!

Bonus: The [DiamondLoupefacet](contracts/facets/DiamondLoupeFacet.sol) uses an updated [LibDiamond](contracts/libraries//LibDiamond.sol) which utilises solidity custom errors to make debugging easier especially when upgrading diamonds. Take it for a spin!!

Need some more clarity? message me [on twitter](https://twitter.com/Timidan_x), Or join the [EIP-2535 Diamonds Discord server](https://discord.gg/kQewPw2)
