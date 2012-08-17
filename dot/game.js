//global varibles

var width = 700;
var height = 700;
var bn = 8;		//number of boxs
var bs = 600/8; 		//boxsize

var board;
var context;
var vArray = [];	//array of vertical lines
var hArray = [];
var boxArray = [];	//array of filled boxes
var blueTurn;

//initilizes empty arrays representing game state
function startGame() 
{
	board = document.getElementById("board");
	context = board.getContext("2d"); 
	context.font = "50pt Calibri";
	
	//fills vArray with 0s
	for (var x = 0; x < bn + 1; x++) {
		vArray[x] = [];
		for (var y = 0; y < bn; y++) {
			vArray[x][y] = false;
		}
	}
	
	//fills hArray with 0s
	for (var x = 0; x < bn; x++) {
		hArray[x] = [];
		for (var y = 0; y < bn + 1; y++) {
			hArray[x][y] = false;
		}
	}	
	
	//fills boxArray with 0s
	for (var x = 0; x < bn; x++) {
		boxArray[x] = [];
		for (var y = 0; y < bn; y++) {
			boxArray[x][y] = 0;
		}
	}	
	
	//sets starting player
	blueTurn = true;
	
	//listens for clicks on the board	
	board.addEventListener("mousedown",click,false);
	drawBoard();
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

	
	//draw grid
	drawGrid();
	
	//draw lines placed by players
	drawLines();
	
	//draws filled boxs
	drawFilledBox();
	
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

//draws in lines clicked by player
function drawLines()
{
	//lines are black
	context.fillStyle = "rgb(0,0,0)";
	
	//draws vertical lines
	for (var x = 0; x < bn + 1; x++) {
		for (var y = 0; y < bn; y++) {
			if (vArray[x][y]) { 
				context.fillRect(x*bs, y*bs, 4, bs+3);
			}
		}
	}
	
	//draws horizontal lines
	for (var x = 0; x < bn; x++) {
		for (var y = 0; y < bn + 1; y++) {
			if (hArray[x][y]) { 
				context.fillRect(x*bs, y*bs, bs+3, 4);
			}
		}
	}	
}

//draws boxes surrounded by lines
function drawFilledBox()
{
	for (var x = 0; x < bn; x++) {
		for (var y = 0; y < bn; y++) {
			if(boxArray[x][y] == 1) {
				context.fillStyle = "rgb(200,0,0)";
				context.fillRect(x*bs+5,y*bs+5,bs-7,bs-7);
			}
			else if(boxArray[x][y] == 2) {
				context.fillStyle = "rgb(0,0,200)";
				context.fillRect(x*bs+5,y*bs+5,bs-7,bs-7);
			}
		}
	}	
}

//displays filled box count at the bottom of the screen
function drawScore()
{	
	var redScore = findScore(1);
	context.fillStyle = "rgb(200,0,0)";
	context.fillText(redScore, 100, 660);
	
	var blueScore = findScore(2);
	context.fillStyle = "rgb(0,0,200)";
	context.fillText(blueScore, 500, 660);
	
	//underlines the score if it is that players turn
	context.fillStyle = "rgb(0,200,0)";
	if (blueTurn) {
		context.fillRect(490, 670, 62, 4);
	}
	else {
		context.fillRect(90, 670, 62, 4);
	}		
}

//counts the total boxes by the passed player color
function findScore(color) {
	score = 0;
	for (var x = 0; x < bn; x++) {
		for (var y = 0; y < bn; y++) {
			if (boxArray[x][y] == color) {
				score++;
			}
		}
	}
	return score;
}

//called when the page is clicked
function click(e)
{
	var pos = findPos(this);
	var cord = findCord(e.pageX - pos.x, e.pageY - pos.y);
	if (cord) {
		//if line is added to board, redraw lines
		if (attemptMove(cord.vertical, cord.x, cord.y)) {
			drawBoard();
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
		//closer to left & bottom
		if (x - xs*bs < y - ys*bs) {
			//closer to left & top
			if (x - xs*bs < (ys+1)*bs - y) {
				RV.vertical = true;
			}
			//bottom
			else {
				RV.vertical = false;
				RV.y = RV.y + 1;
			}
		}
		//closer to right & top
		else
		{
			//closer to left & top
			if (x - xs*bs < (ys+1)*bs - y) {
				RV.vertical = false;
			}
			//right
			else {
				RV.vertical = true;
				RV.x = RV.x + 1;
			}			
		}
		
	}
	//cord not on grid; return false
	else {
		RV = false;
	}
	
	return RV;
}

//Trys to add line to board. Returns true if position is not filled
function attemptMove(vertical, x, y)
{
	var success = false;		//function will return true if line is not filled
	var switchPlayer = true;	//if no box is completed, player color will switch
	
	if (vertical) {
		if (!vArray[x][y]) {
			success = true;
			vArray[x][y] = true;
			if (boxCompleted(x,y)) {
				switchPlayer = false;
			}
			if (boxCompleted(x-1,y)) {
				switchPlayer = false;
			}
		}
	}
	else if (!hArray[x][y]) {
		success = true;
		hArray[x][y] = true;
		if (boxCompleted(x,y)) {
			switchPlayer = false;
		}
		if (boxCompleted(x,y-1)) {
			switchPlayer = false;
		}
	}
	
	if (switchPlayer) {
		blueTurn = !blueTurn;
	}
	
	return success;
	
	
}

//colors a box based on current player color if it is surroned by lines
//returns true if box has been filled
function boxCompleted (x, y) {
	//checks to make sure box is in grid
	if (0<=x && x<bn && 0<=y && y<bn) {
		if (vArray[x][y] && vArray[x+1][y] && hArray[x][y] && hArray[x][y+1]) {
			if (blueTurn) {
				boxArray[x][y] = 2;
			}
			else {
				boxArray[x][y] = 1;
			}
			return true;
		}
	}
	return false;
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



