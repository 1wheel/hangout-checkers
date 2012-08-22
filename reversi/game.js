//global varibles
var width = 400;
var height = 400;
var bn = 8;				//number of boxs
var bs = 400/8; 		//boxsize

var board;			//canvas
var context;		//canvas context
var container;		//holds color score, player names and join button

var cArray = [];	//array of placed chits
var vArray = [];	//array of valid moves
var blackTurn;

//stores participantID and corrisponding team color
var participantID = [];
var participantTeam = [];

var log;
var log1;

//initilizes empty arrays representing game state
function startGame() 
{
	//fills cArray with 0s
	for (var x = 0; x < bn; x++) {
		cArray[x] = [];
		vArray[x] = [];
		for (var y = 0; y < bn; y++) {
			cArray[x][y] = 0;
			vArray[x][y] = 0;
		}
	}
	
	//places starting pieces
	cArray[3][3] = -1;
	cArray[4][4] = -1;
	cArray[3][4] = 1;
	cArray[4][3] = 1;
	
	//sets starting player
	blackTurn = true;
	
	setupCanvasObjects();
}

//creates on context object and listener
function setupCanvasObjects() {
	board = document.getElementById("board");
	context = board.getContext("2d"); 
	context.font = "50pt Calibri";	
	
	container = document.getElementById("container");
	//listens for clicks on the board	
	board.addEventListener("mousedown",click,false);
}

//clears canvas and redraws board
function drawBoard() 
{
	//clear and resize canvas
	//board.width = width;
	//board.height = height;
	
	//clears canvas
	context.fillStyle = "rgb(255,255,255)";
	context.fillRect(0, 0, width, height);
	context.fillStyle = "rgb(0,200,0)";
	context.fillRect(0, 0, bn*bs, bn*bs);
	
	//draw grid
	drawGrid();
	
	//draw pieces placed by players
	createValidMoveArray();
	drawPieces();
	
	drawScore();
}	

//draws grid of lines 
function drawGrid()
{
	//draw vertical lines
	for (var x=0; x<=bn*bs; x+= bs) {
		context.moveTo(x,0);
		context.lineTo(x,bn*bs);
	}
	
	//draw horizontal lines
	for (var y=0; y<=bn*bs; y+= bs) {
		context.moveTo(0,y);
		context.lineTo(bn*bs,y);
	}
	
	//fills in lines in offwhite
	context.strokeStyle = "rgb(190,190,190)";
	context.stroke();
}

//draw pieces placed by players
function drawPieces()
{
	for (var x = 0; x < bn; x++) {
		for (var y = 0; y < bn; y++) {
			if (cArray[x][y] != 0) {
				drawPiece(x,y,cArray[x][y],8);
			}
			else if (vArray[x][y] != 0) {
				drawPiece(x,y,vArray[x][y],30);
			}
		}
	}
}

//draws a single piece at x, y with color and size passed
//larger size values make smaller pieces
function drawPiece(x, y, color, size) 
{
	if (color == 1) {
		context.fillStyle = "rgb(0,0,0)";
	}
	else {
		context.fillStyle = "rgb(255,255,255)";
	}
	
	context.fillRect(x*bs + size, y*bs + size, bs - size*2, bs - size*2);
}

//displays filled box count at the bottom of the screen
function drawScore()
{	
	var blackScore = findScore(1);
	var whiteScore = findScore(-1);
	
	document.getElementById("blackScore").innerHTML = blackScore;
	document.getElementById("whiteScore").innerHTML = whiteScore;
}

//counts the total boxes by the passed player color
function findScore(color) {
	score = 0;
	for (var x = 0; x < bn; x++) {
		for (var y = 0; y < bn; y++) {
			if (cArray[x][y] == color) {
				score++;
			}
		}
	}
	return score;
}

//called when the page is clicked
function click(e)
{
	var color = currentColor();
	var pos = findPos(this);
	var cord = findCord(e.pageX - pos.x, e.pageY - pos.y);
	if (cord) {
		//if line is added to board, redraw lines
		if (vArray[cord.x][cord.y] != 0) {
			var flippedChips = findFlipDirections(cord.x, cord.y, color);
			for (var i = 0; i < flippedChips.length; i++) {
				cArray[flippedChips[i].x][flippedChips[i].y] = color;
			}
			cArray[cord.x][cord.y] = color;
			
			blackTurn = !blackTurn;
			
			//uploads newboard state
			gapi.hangout.data.submitDelta({cArray:JSON.stringify(cArray), blackTurn:JSON.stringify(blackTurn)});
			
			//drawBoard();
		}
	}
}

//finds which line the passed cord is closest to
function findCord(x, y) 
{	
	var RV = new Object; 	//return value
	
	//true if point is inside grid
	if (0 < x && x < bs*bn && 0 < y && y < bs*bn){
		xs = Math.floor(x/bs);
		ys = Math.floor(y/bs);
		
		RV.x = xs;
		RV.y = ys;
	}
	//cord not on grid; return false
	else {
		RV = false;
	}
	
	return RV;
}

//find valid moves
function createValidMoveArray() {
	var color = currentColor();
	for (var x = 0; x < bn; x++) {
		for (var y = 0; y < bn; y++) {
			vArray[x][y] = 0;
			if (cArray[x][y] == 0) {
				if (findFlipDirections(x,y,color).length>0){
					vArray[x][y] = color;
				}
			}
		}
	}
}

//from a given location, trys all flip directions
//returns an array of all the pieces that will be flipped if move is valid
//returns false otherwise
function findFlipDirections(x,y,color)
{
	var rv = [];
	var flippedChips;
	for (var dx	= -1;  dx<=1; dx++){
		for (var dy	= -1;  dy<=1; dy++){
			if (dx != 0 || dy != 0) {
				flippedChips = findFlipLength(x,y,dx,dy,color);
				for (var i = 0; i < flippedChips.length; i++) {
					rv[rv.length] = flippedChips[i];
					
				}
			}
		}
	}
	return rv;
}

//passed a location and direction
function findFlipLength(x,y,dx,dy,color)
{	
	var rv = [];
	var i = 1;
	while (onBoard(x+i*dx,y+i*dy) && cArray[x+dx*i][y+dy*i] == -1*color) {
		i++;	
	}
	
	if (i>1 && onBoard(x+i*dx,y+i*dy) && cArray[x+dx*i][y+dy*i] == color) {
		
		for (var j = 0; j<i; j++) {
			rv[j] = new Object;
			rv[j].x = x+j*dx;
			rv[j].y = y+j*dy;
		}
	}
	
	return rv;
}

//returns true if the cord is on the board
function onBoard(x, y) {
	return (0 <= x && x <= 7 && 0 <= y && y <= 7);
}

//finds color of the player
function currentColor(){
	var color;
	if (blackTurn) {
		color = 1;
	}
	else {
		color = -1 ;
	}
	return color;
}

//finds how much the canvas is offset in the frame
function findPos(obj) {
	var curleft = 0, curtop = 0;
	if (obj.offsetParent) {
		do {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		} while (obj = obj.offsetParent);
		return { x: curleft, y: curtop };
	}
	return undefined;
}

//game starts when hangout API is ready
gapi.hangout.onApiReady.add(function(eventObj){
	if (eventObj.isApiReady) { 
	try {
		var state = gapi.hangout.data.getState();
		
		if (state.cArray) {
			//game already running, join it
			setupCanvasObjects();
			serverUpdate();
		}
		else {
			//no game running, start a new one
			startGame();
		}

		//adds the local player to team and saves id
		participantID[participantID.length] = gapi.hangout.getParticipantId();
		participantTeam[participantTeam.length] = 0;
		
		//creates a listener for state changes. calls serverUpdate() when activated
		gapi.hangout.data.onStateChanged.add(function(stateChangeEvent) {
			try {
				serverUpdate(stateChangeEvent.state);
			}
			catch (e) {
				alert("update error");
				log1 = e;
			}
		});		
		
		//updates server with game info
		gapi.hangout.data.submitDelta({
			participantID:	JSON.stringify(participantID), 
			participantTeam:JSON.stringify(participantTeam),
			cArray:			JSON.stringify(cArray), 
			blackTurn:		JSON.stringify(blackTurn)
		});
	}
	catch(e) {
		alert("init error");
		log = e;
	}
	}
});

//if global state is changed, update local copy of global varibles and redraw board
function serverUpdate(){
	var state = gapi.hangout.data.getState();
	blackTurn = JSON.parse(state.blackTurn);
 	cArray = JSON.parse(state.cArray);
	participantID = JSON.parse(state.participantID);
	participantTeam = JSON.parse(state.participantTeam);
    drawBoard();
	participantUpdate();
}

//updates list of particpants and the presence of switch team buttons
function participantUpdate(){
	//team of the local user
	var team = participantTeam[idIndex(gapihangout.getParticipantId())];
	
	//adds buttons
	addButton('joinBlack',team);
	addButton('joinNone',team);
	addButton('joinWhite',team);
}

function addButton(bName, team){
	//true if player is currently on team - no join Button displayed
	if (	(bName == 'joinBlack' && team == 1)
			||(bName == 'joinNone' && team == 0)
			||(bName == 'joinWhite' && team == -1)
	){
		document.getElementById("bName").innerHTML = "";
	}
	//displays join button
	else {
		document.getElementById("bName").innerHTML = "<input type='button' value='Join' onclick='changeTeam(" + team + ";)) />";		
	}
}

function changeTeam(team){
	participantTeam[idIndex(gapi.hangout.getParticipantId())] = team;
	//sends switch to server
	gapi.hangout.data.submitDelta({
			participantID:	JSON.stringify(participantID), 
			participantTeam:JSON.stringify(participantTeam),
	});
}
	
//finds index of passed ID in participantID array
function idIndex(id) {
	var i = 0;
	while(i < participantID.length)
	{
		if (participantID[i] == id) {
			return i;
		}
		i++;
	}
	//passed id not in array, add entry
	participantID[i] = id;
	participantTeam[i] = 0;
	return i;
}
	
	
