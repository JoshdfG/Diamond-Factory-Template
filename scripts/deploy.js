const { getSelectors, FacetCutAction } = require("./libraries/diamond.js");
const { ethers } = require("hardhat");
const fs = require("fs");

async function deployDiamond() {
  const accounts = await ethers.getSigners();
  // const contractOwner = accounts[0];
  const contractOwner = new ethers.Wallet(process.env.PRIVATE_KEY).address;
  const address_zero = "0x0000000000000000000000000000000000000000";

  // deploy DiamondCutFacet
  const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
  const diamondCutFacet = await DiamondCutFacet.deploy();
  await diamondCutFacet.deployed();
  console.log("DiamondCutFacet deployed:", diamondCutFacet.address);

  //deploy certificateFactory
  const CertificateFactory =
    await ethers.getContractFactory("certificateFactory");
  const certificateFactory = await CertificateFactory.deploy();
  await certificateFactory.deployed();
  console.log("CertificateFactory deployed:", certificateFactory.address);

  // deploy DiamondInit
  // DiamondInit provides a function that is called when the diamond is upgraded to initialize state variables
  // Read about how the diamondCut function works here: https://eips.ethereum.org/EIPS/eip-2535#addingreplacingremoving-functions
  const DiamondInit = await ethers.getContractFactory("DiamondInit");
  const diamondInit = await DiamondInit.deploy();
  await diamondInit.deployed();
  console.log("DiamondInit deployed:", diamondInit.address);

  // deploy facets
  console.log("");
  console.log("Deploying facets");
  const FacetNames = [
    "DiamondLoupeFacet",
    "OwnershipFacet",
    "DeployOrgDiamondFacet",
    "OrganisationDeployerFacet",
    "DeployFacet",
    "OrganisationFactoryFacet",
  ];
  const cut = [];
  for (const FacetName of FacetNames) {
    const Facet = await ethers.getContractFactory(FacetName);
    const facet = await Facet.deploy();
    await facet.deployed();
    console.log(`${FacetName} deployed: ${facet.address}`);
    cut.push({
      facetAddress: facet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(facet),
    });
  }
  console.log("Diamond Cut Array:", cut);
  // Write the array to a file in the `scripts` directory
  const filePath = "./scripts/cutData.js";
  const fileContent = `module.exports = ${JSON.stringify(cut, null, 2)};`;

  fs.writeFileSync(filePath, fileContent, "utf8");

  console.log(`Cut data has been written to ${filePath}`);
  // deploy Diamond
  const Diamond = await ethers.getContractFactory("Diamond");
  const diamond = await Diamond.deploy(contractOwner, cut, address_zero, "0x");
  await diamond.deployed();
  console.log("Diamond deployed:", diamond.address);
  fs.writeFileSync(
    "./scripts/diamondAddress.js",
    `module.exports = "${diamond.address}";`,
    "utf8",
  );

  // upgrade diamond with facets
  // console.log("");
  // console.log("Diamond Cut:", cut);
  // const diamondCut = await ethers.getContractAt("IDiamondCut", diamond.address);
  // let tx;
  // let receipt;
  // // call to init function
  // let functionCall = diamondInit.interface.encodeFunctionData("init");
  // tx = await diamondCut.diamondCut(cut, diamondInit.address, functionCall);
  // console.log("Diamond cut tx: ", tx.hash);
  // receipt = await tx.wait();
  // if (!receipt.status) {
  //   throw Error(`Diamond upgrade failed: ${tx.hash}`);
  // }
  // console.log("Completed diamond cut");
  // return diamond.address;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  deployDiamond()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

exports.deployDiamond = deployDiamond;
