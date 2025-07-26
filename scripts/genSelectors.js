const ethers = require("ethers");
const path = require("path");

const args = process.argv.slice(2);

if (args.length !== 1) {
  console.log(`Please supply the correct parameters:
    facetName
  `);
  process.exit(1);
}

async function printSelectors(contractName, artifactFolderPath = "../out") {
  const contractFilePath = path.join(
    artifactFolderPath,
    `${contractName}.sol`,
    `${contractName}.json`,
  );
  const contractArtifact = require(contractFilePath);
  const abi = contractArtifact.abi;
  const bytecode = contractArtifact.bytecode;
  const target = new ethers.ContractFactory(abi, bytecode);

  // Get unique function signatures
  const signatures = [...new Set(Object.keys(target.interface.functions))]; // Remove duplicates

  // Generate selectors, excluding problematic functions like 'init(bytes)'
  const selectors = signatures.reduce((acc, val) => {
    if (val !== "init(bytes)") {
      try {
        const sighash = target.interface.getSighash(val);
        if (!acc.includes(sighash)) {
          // Ensure no duplicate selectors
          acc.push(sighash);
        }
      } catch (error) {
        console.error(`Error generating selector for ${val}: ${error.message}`);
      }
    }
    return acc;
  }, []);

  const coder = ethers.utils.defaultAbiCoder;
  const coded = coder.encode(["bytes4[]"], [selectors]);

  process.stdout.write(coded);
}

printSelectors(args[0])
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
