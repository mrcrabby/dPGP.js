var pushGP = null;
var newChart = null;


function start() {
    //set up chart
    newChart = new Chart();
    
    //add button evt
    $('#runGP').click(function() {
        var casesStr = "";
        var cases = [];
        
        newChart.points =[ 2,4,6,8,10,12,14,16,18,20   ];
        
        for (var caseX = 0; caseX < newChart.points.length; caseX++) {
            if (newChart.points[caseX] == undefined) continue;
            
            casesStr += caseX + "\t" + newChart.points[caseX] + "\n";
            cases.push([caseX,newChart.points[caseX]]);
        }
        
        if (cases.length == 0) {
            alert("Please draw a function first.");
            return;
        }
        
        newChart.lockDrawing();
        
        $(this).attr('disabled','true');
        $('#iterateGP').show().attr('disabled','true');
                
        $('#fitnessCases').text(casesStr);

        createPushGP();
        pushGP.startGP(cases);/*[[0,1],[2,5],[3,100]]);*/
        doGPGeneration();
        
        $('#iterateGP').attr('disabled','');
    });
    
    $('#iterateGP').click(function() {
        if (pushGP == null)
            return;
            
        doGPGeneration();
    });

    $('#iterateGP').hide();
    $('#gpResults').hide();
    
    $('#hideLink').hide();
    
    $('#showLink').click(function(){
        $('#hideLink').show();
        $(this).hide();
        
        $('#gpResults').show();
    });
    
    $('#hideLink').click(function(){
        $('#showLink').show();
        $(this).hide();
        
        $('#gpResults').hide();
    });
    
    
    newChart.acceptDrawing();
   $("#testChart").append(newChart.returnElement());
   
   updateStatus("Draw a function.");
}

function updateStatus(status) {
    $('#statusText').html(status);
}

function doGPGeneration(){
    pushGP.doGeneration();
    
    $('#gpResults').html(pushGP.getProgramsHTMLString());
    // $('#gpResults').show();
}

function createPushGP() {
    pushGP = new PushGP();

    
    // for (var x = 0; x < pushGP.pushPrograms.length; x++) {
    //     $('#gpResults').append($("<div></div>").html(pushGP.pushPrograms[x].code));
    //    $('#gpResults').append($("<div></div>").html(pushGP.pushPrograms[x].fitness));
    // }
    // 
    // $('#gpResults').show();
}

Chart = function() {
    //Chart on XY interval from -10 to 10
    
    this.points = [];
    
    this.chartCanvas = null;
    this.canDraw = false;
    this.mouseDown = false;
    
    this.reset();
};

Chart.prototype.reset = function () {
    this.push_code = "";

    for (var x = 0; x < 500; x++)
        this.points[x] = undefined;
};

Chart.prototype.returnElement = function () {
  var chartCanvas = $('<canvas width=500 height=500></canvas>');
  $(chartCanvas).css('cursor','crosshair');

  var element = $('<div>').css('border','3px solid');
  element.css('border-color',"rgb(0,120,0)");
  
  element.css('width','500');
  element.css('height','500');
  
  var resetLink = $('<a href="#"></a>');
  resetLink.text("reset");
  resetLink.css("font-weight","10");
    
  this.chartCtx = chartCanvas.get()[0].getContext('2d');
  
  var charObj = this;
  
  resetLink.click(function(){
     charObj.reset(); 
     
     charObj.draw();
  });
  
  chartCanvas.mousemove(function(e) {
      var element_dom = element.get()[0];
      
      var hoverX = (e.pageX - element_dom.offsetLeft);
      var hoverY = (e.pageY - element_dom.offsetTop);      

      if (charObj.mouseDown)
        charObj.drawAddPoint(hoverX, hoverY);
      charObj.draw()
      
      var testPt = (((hoverY-500/2)/500) * 10 * 2);

      $('#pos').text(testPt/2/10*500*2+500);// + ", " + (((hoverX-500/2)/500) * 10 * 2)));
      // charObj.drawCursor(hoverX, hoverY);        
  });
  
  chartCanvas.mouseup (function(e) { 
    if (!charObj.canDraw) return;
    
    charObj.mouseDown = false;
  });
  
  chartCanvas.mousedown (function(e) { 
    if (!charObj.canDraw) return;
    
    charObj.mouseDown = true;
  });
  
  element.append(chartCanvas);
  element.append(resetLink);

  this.drawAxis();
  
  return element;
};

Chart.prototype.drawAddPoint = function (x,y) {
  // //adjust Y to range -10...10
  // var projectedY = -(((y-500/2)/500) * 10 * 2);
  for (var idx = x-3; idx < x+3; idx++)
    this.points[idx] = y;
};

Chart.prototype.lockDrawing = function () {
    this.canDraw = false;
};

Chart.prototype.acceptDrawing = function () {
  this.canDraw = true;
};

Chart.prototype.draw = function () {
  this.clearCanvas();
  this.drawAxis();  
  
  if(this.canDraw) {
      this.drawPoints();
  }
};

Chart.prototype.drawPoints = function () {
    for (var x = 0; x < this.points.length; x++) {
        if (this.points[x] == undefined) continue;

        this.chartCtx.fillStyle = "rgb(0,230,0)";

        this.chartCtx.fillRect(x,(this.points[x])-3,6,6);
        this.chartCtx.fill();
    }
};

Chart.prototype.clearCanvas = function () {
    this.chartCtx.fillStyle = "rgb(255,255,255)";
    
    this.chartCtx.fillRect(0,0,500,500);
    this.chartCtx.fill();
}

Chart.prototype.drawCursor = function (x,y) {
  this.chartCtx.fillRect(x+3,y,7,7);
  this.chartCtx.fill();
};

Chart.prototype.drawAxis = function () {
    this.chartCtx.fillStyle = "rgb(0,0,0)";
    
    var thickness = 2; //2px
    
    //y axis
    this.chartCtx.fillRect(500/2 - (thickness/2),0,thickness,500);
    
    //x axis
    this.chartCtx.fillRect(0,500/2 - (thickness/2),500,thickness);
    
    this.chartCtx.fill();
};
// 
// function rposition(jqelement, mouseX, mouseY) {
//   var offset = jqelement.offset();
//   var x = mouseX - offset.left;
//   var y = mouseY - offset.top;
// 
//   return {'x': x, 'y': y};
// }
