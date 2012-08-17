//global varibles
var width = 300;
var height = 300;
var board;
var context;
var xArray = [];
var oArray = [];
var xTurn;

function startGame() 
{
	board = document.getElementById("board");
	context = board.getContext("2d"); 
	context.font = "50pt Calibri";
	xTurn = true;
	
	drawBoard();
}

 function drawBoard() 
 {
	//clear and resize canvas
	//board.width = width;
	//board.height = height;

	//draw grid
	drawGrid();
	
	//draw pieces
	drawXandOs();
	
	//listens for clicks on the board
	board.addEventListener("mousedown",click,false);

 }	
	
function drawGrid()
{
	context.fillRect(1/3*width,0,10,height);
	context.fillRect(2/3*width,0,10,height);
	context.fillRect(0,1/3*height,width,10);
	context.fillRect(0,2/3*height,width,10);
}

function drawXandOs()
{
	for (var i = 0; i < xArray.length; i++) {
		drawPiece(xArray[i][0], xArray[i][1], "X");
	}
	
	for (var i = 0; i < oArray.length; i++) {
		drawPiece(oArray[i][0], oArray[i][1], "O");
	}
}

function drawPiece(x, y, letter)
{	
	context.fillText(letter, 1/6*width*(.5+2*x), 1/6*width*(1.5+2*y));
}

//called when the page is clicked
function click(e)
{
	var pos = findPos(this);
	xCord = findCord(e.pageX - pos.x);
	yCord = findCord(e.pageY - pos.y);

	//checks to make sure click was on the board
	if (xCord + 1 && yCord + 1) {
		//checks to make sure a piece isn't covering up another
		if (validMove(xCord, yCord)) {
			if (xTurn) {
				xArray[xArray.length] = [xCord, yCord];
			}
			else {
				oArray[oArray.length] = [xCord, yCord];
			}
			xTurn = !xTurn;
			drawXandOs();
		}
	}
}

//finds what third of the canvas the click was in. null if outside
function findCord(x, y) 
{
	if (0<= x && x <= 1/3*width) {
		cord = 0;
	}
	else if (1/3*width<= x && x <= 2/3*width) 
	{
		cord = 1;
	}
	else if (2/3*width<= x && x <= 3*width) 
	{
		cord = 2;
	}
	
	return cord;
}

//checks to see if proposed move has been taken already
function validMove(x, y)
{
	var valid = true;
	for (var i = 0; i < xArray.length; i++) {
		if (xArray[i][0] == xCord && xArray[i][1] == yCord) {
			valid = false;
		}
	}

	for (var i = 0; i < oArray.length; i++) {
		if (oArray[i][0] == xCord && oArray[i][1] == yCord) {
			valid = false;
		}
	}
	
	return valid;
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


