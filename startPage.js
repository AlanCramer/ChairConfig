
$(document).ready(function() {
  
    theApp.connectFeedrateControlInteraction();    
    theApp.connectFrameStyleImageInteraction();
}); 

theApp = {
   
    connectFeedrateControlInteraction: function() {

        $("#feedrateDropdown").change(function() {
             var fr_val = document.getElementById("feedrateDropdown").value;
             
             if (fr_val != 0) // don't reset custom   
                document.getElementById("feedrate").value = fr_val;         
        });
        
        $("#feedrate").change(function() {
        
             // select the last one, "custom"       
            var fr_dd = $('select#feedrateDropdown');        
            
            var fr_dd_2 = $("#feedrateDropdown");
            fr_dd_2[0].selectedIndex=3;
            
        });
    },
    
    frameShapeToImg: function(frameShape) {
    
        var img = "";
        switch (frameShape) {
            case "rect":
                img = "images_b/2.bmp";
                break;       
            case "oval":     
                img = "images_b/2_s.bmp";
                break;       
            case "conc":     
                img = "images_b/3.bmp";
                break;       
            case "knob":     
                img = "images_b/3_s.bmp";
                break;       
            case "brac":     
                img = "images_b/4.bmp";
                break;       
            case "heart":    
                img = "images_b/4_s.bmp";
                break; 
            default:
                alert("Unsupported frame style");
                break;
        };
        
        return img;
    },
    
    connectFrameStyleImageInteraction: function() {

        $( "label[for='frameShape']" ).mouseover(function() {

            var caller = $(this)[0];
            var callerId = caller.id;

            var imgurl = theApp.frameShapeToImg(callerId);
            
            var img = $("img[id='frameShape']")[0];
            img.src = imgurl;            
        });
        
        $( "label[for='frameShape']" ).mouseout(function() {

            var selectedId = document.querySelector('input[name="frameShape"]:checked').value;
            var imgurl = theApp.frameShapeToImg(selectedId);
            
            var img = $("img[id='frameShape']")[0];
            img.src = imgurl;
        });
    },
    
    collectParams: function(doc) {
   
        var res = {};

        res.inchToMm = 25.4; 

        res.matDepth = doc.getElementById("matDepth").valueAsNumber;
        res.bitDiam = doc.getElementById("bitDiam").valueAsNumber;
        res.feedrate = doc.getElementById("feedrate").valueAsNumber; // in/min       
        res.depthPerPass = doc.getElementById("depthPerPass").valueAsNumber;
        
        res.stepover = 1; // (0, 1]
         
        return res;
    },
        
    OnLoadSVG: function() {

        var fileElem = $("#opensvg");
        fileElem.click();
    },
        
    OnExportGCode: function() {

        var params = theApp.collectParams(document);
        
        var cutDepth = -1*document.getElementById("matDepth").valueAsNumber;
                
        //var toolDiam = params.bitDiam; // in inches
        var depthPerPass = -1*params.depthPerPass;
        var feedRate = params.feedrate;
        var pathUnitsPerIn = params.pathUnitsPerIn;
        var jogHeight = 1.0; // inches 
        
        var gcode = this.generateGCode(cutDepth, depthPerPass, feedRate, jogHeight);
        this.exportToFile(gcode, "partGCode.nc");
        
    },
    
    OnCalcGCode: function() {

        var params = theApp.collectParams(document);
        
        var cutDepth = -1*document.getElementById("matDepth").valueAsNumber;
                
        //var toolDiam = params.bitDiam; // in inches
        var depthPerPass = -1*params.depthPerPass;
        var feedRate = params.feedrate;
        var jogHeight = 1.0; // inches 
        
        var gcode = this.generateGCode(cutDepth, depthPerPass, feedRate, jogHeight);
        
        gcode = gcode.replace(/\n\r?/g, '<br />');
        var stat = document.getElementById("status");
        stat.innerHTML = gcode;
    },
    
    // both cutDepth and depthPerPass are have a sign (are negative)
    generateGCode: function(cutDepth, depthPerPass, feedRateInPerMin, jogHeight) {
           
        var gCode = "";

        gCode += this.gCodeSetUp(feedRateInPerMin);
        
        var curDepth = 0;
        var done = false;
        while (!done) {
        
            curDepth += depthPerPass;
            
            if (curDepth <= cutDepth) {
                curDepth = cutDepth;
                done = true;
            }
                
            gCode += "I'm a line of gcode\n";            
        }
        
        gCode += this.gCodeTakeDown(jogHeight);
        return gCode;
    },
    
    
    // pull up to height, move to pt, plunge to cut depth
    gCodeJogTo: function(pt, pathUnitsPerIn, jogHeight, cutDepth) {

        var gCode = "";
        gCode += "G0 Z" + jogHeight.toString() + "\n";
        gCode += this.gCodeMoveTo(pt, pathUnitsPerIn, jogHeight);
        gCode += "G0 Z" + cutDepth.toString() + "\n";        
    
        return gCode;
    },
        
    gCodeMoveTo: function(pt, pathUnitsPerIn, zVal) {
            
        var ptX  = pt.X/pathUnitsPerIn;
        var ptY = pt.Y/pathUnitsPerIn;
        ptX = ptX.toFixed(5);
        ptY = ptY.toFixed(5);
        
        var gCode = "X" + ptX.toString() + " Y" + ptY.toString() + " Z" + zVal.toString() + "\n";
        
        return gCode;
    },
    
    gCodeTakeDown: function (finalHeight) {

        var gCode = "";
        gCode += "G0 Z" + finalHeight.toString() + "\n"; // pull up to ceiling
        return gCode;
    },

    gCodeSetUp: function(feedrateInPerMin) {
        
        var gCode = "";
        //gCode += "(ToDo, add information about what, how, when, and who made this file)\n\n";
        
        // initialization
        gCode += "G17 (set XY Plane)\n";
        gCode += "G20 (inches)\n";
        gCode += "G40 (Tool Radius Compensation: off)\n";
        gCode += "G49 (Tool Length Offset Compensation: off)\n";
        gCode += "G54 (Work Coordinate System)\n";
        gCode += "G80 (Cancel Canned Cycle)\n";
        gCode += "G90 (absolute programming)\n";
        gCode += "G94 (feedrate per minute)\n";
        gCode += "\n";
        
        
    //    gCode += "G0 Z" + initZinch + " (initial z value, in inches)\n"; 
        gCode += "F" + feedrateInPerMin + " (feedrate - in inches per minute)\n";
    
        gCode += "\n";
        gCode += "M3 (start spindle)\n";
        gCode += "S0,0 (start spindle in SBP)\n";
        gCode += "\n";
            
        return gCode;
    },
    
    exportToFile: function(content, filename) {

        var file = "data:text/csv;charset=utf-8,";
        file += content;
        
        var encodedUri = encodeURI(file);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        
        link.click();
    },
};

