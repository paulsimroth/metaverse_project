//Constants for Map management
const tiles = 12;//in pixels
const plots = tiles * 9;
const roads = tiles * 2;
const initOffsets = plots + roads;
const plotViewOffsets = plots + (2 * roads);

//canvas and context
const mainCanvas = document.getElementById("mainCanvas");
const mainCtx = mainCanvas.getContext('2d');
const plotCanvas = document.getElementById("plotCanvas");
const plotCtx = plotCanvas.getContext('2d');
const worldImage = new Image();

//state
const mapView = {mapOffsetX: -1 * initOffsets, mapOffsetY: -1 * initOffsets};
const plotView = {plotId: "", plotX: 0, plotY: 0, locationX: 0, locationY: 0};
const unassignables = [
    "0xf3ce3e48667649091ed7c33c9edd3bdf6683b101e4c6df4d847c7f9f038e4434",
    "0xc863be1a7bf935989ad343563369d774c9f44de54682b1b468472ebdd4fb52af",
    "0xbc2f3e780e63f6f78be4b7e4c6f348de13962838b5e4874cb68e375560e92739",
    "0x834ed64df3e5b738143b3cba1ba19786ea8ef509dc58327f4b1ab0307c75872e",
    "0x2f92fa629f7a5735c83956c713b51ec868ddf8f0eaa650a5652873554a3c4725",
    "0x9eeff8aa774613bbb94385083deb39df1f10b2f05692c95263c2b221960ecca9",
    "0x841bca84c89d2830ad7e703a36ee9534f80f0c39a462491c4c2a4489dec6b9cf",
    "0x39cac9e1eea3e33bea94196422490d66ddb1aa06bf4771c7fe3aa3456a513a1c",
    "0x8b50d3acf3113e6275d60a4fa70cc23cdd1d1a39a0ba1994286b38c07d302ad9",
    "0xb181091be9416162a2820ddfe2f6878e567139a50cab661e52d4f3e70e33774a",
    "0x97255074fdd7e3d3325b2f2c1dce9f1097696f6b4947ca410e90a2b7f6eb6f04",
    "0x7f930a017f921c3b3c57be76fc879095c015401ab28fed013504e6fb598c7955"
];

//Web3 constants
const contractAddress = "0x0C7abf7F2CcB0123d8A75c88557153841b736383";

//canvas drawing functions
function drawCanvas() {
    mainCanvas.width = 3 * plots + 4 * roads;
    mainCanvas.height = 3 * plots + 4 * roads;
    plotCanvas.width = plots;
    plotCanvas.height = plots;
    worldImage.src = 'static/Moraland.png';
    worldImage.onload = () => {
        initializeMap();
    }
};

function initializeMap() {
    updatePlotLocation();
    drawMapSection(mainCtx, mapView.mapOffsetX, mapView.mapOffsetY);
    drawCursor(plotViewOffsets, plotViewOffsets);
    drawMapSection(plotCtx, -1 * plotView.locationX,  -1 * plotView.locationY);
    setPlotData();
};

function drawMapSection(ctx, originX, originY) {
    ctx.drawImage(worldImage, originX, originY);
};

function drawCursor(x, y) {
    mainCtx.strokeRect(x, y, plots, plots)
};

function updatePlotLocation() {
    plotView.locationX = -1 * mapView.mapOffsetX + plotViewOffsets;
    plotView.locationY = -1 * mapView.mapOffsetY + plotViewOffsets;
}

//animate functions
function move(direction) {
    const validMove = validateMove(direction);
    if(validMove) {
        updateView(direction);
        drawMapSection(mainCtx, mapView.mapOffsetX, mapView.mapOffsetY);
        updatePlotLocation();
        drawCursor(plotViewOffsets, plotViewOffsets);
        drawMapSection(plotCtx, -1 * plotView.locationX,  -1 * plotView.locationY);
        setPlotData();
    }
};

function validateMove(direction) {
    switch(direction) {
        case 'ArrowRight': return !(plotView.plotX == 5);
        case 'ArrowUp': return !(plotView.plotY == 0);
        case 'ArrowLeft': return !(plotView.plotX == 0);
        case 'ArrowDown': return !(plotView.plotY == 5);
    }
};

function updateView(direction) {
    switch(direction) {
        case 'ArrowRight':
            plotView.plotX += 1;
            mapView.mapOffsetX -= plots + roads;
            break;
        case 'ArrowDown':
            plotView.plotY += 1;
            mapView.mapOffsetY -= plots + roads;
            break;
        case 'ArrowLeft':
            plotView.plotX -= 1;
            mapView.mapOffsetX += plots + roads;
            break;
        case 'ArrowUp':
            plotView.plotY -= 1;
            mapView.mapOffsetY += plots + roads;
            break;
    }
};

//UI functions
function setPlotData() {
    const plotID = ethers.utils.id(JSON.stringify(plotView));
    document.getElementById("plotX").value = plotView.plotX;
    document.getElementById("plotY").value = plotView.plotY;
    document.getElementById("locationX").value = plotView.locationX;
    document.getElementById("locationY").value = plotView.locationY;
    document.getElementById("plotID").value = plotID;
    _isPlotAssignable(plotID);
};

function _isPlotAssignable(plotID) {
    if (unassignables.includes(plotID)) {
        document.getElementById("claimButton").setAttribute("disabled", null);
    }
    else {
        document.getElementById("claimButton").removeAttribute("disabled");
    }
};

//web3 functions
let provider, signer, instance, marketInstance, user, address;

async function login() {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        user = provider.getSigner();
        address = await user.getAddress();
        instance = new ethers.Contract(contractAddress, contractABI, provider);
        signer = instance.connect(user);
};

async function claimLand() {
    const plotAddress = document.getElementById("plotID").value;
    const assigned = await _isPlotAssigned(plotAddress);
    if(!assigned) {
        await _mint(plotAddress);
    };
};

async function _isPlotAssigned(plotAddress) {
    try{
        const tx = await signer.exist(plotAddress);
        document.getElementById("notifications").innerHTML = `<div class= "alert alert-danger"> <p>Plot is already assigned!</p></div>`
        return tx;
    } catch (e){
        console.log(e);
    };
};

async function _mint(plotAddress) {
    try{
        const tx = await signer.assign(plotAddress);
        const receipt = await tx.wait();
        document.getElementById("notifications").innerHTML = `<div class= "alert alert-success"> <p>You succesfully claimed this plot! Blockhash:</p>${receipt.blockHash} </div>`
    } catch (error){
        document.getElementById("notifications").innerHTML = `<div class= "alert alert-danger"> <p>ERROR! Minting failed, Here is the Error message:</p> ${error.message} </div>`
        console.log(error);
    };
};

const walletButton = document.querySelector('#enableWeb3');
walletButton.addEventListener('click', async() => {
    //Will Start the metamask extension
    if (window.ethereum) { 
        walletButton.innerHTML = "Connecting";
        await login();
        walletButton.innerHTML = address;
    } else {
        walletButton.innerHTML = "FAILED TO CONNECT WEB3; Install Web3 Provider!";
    };
});

drawCanvas();
window.addEventListener('keydown', (e) => {
    move(e.key);
});