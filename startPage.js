
$(document).ready(function() {
  
    theApp.connectFrameStyleImageInteraction();
}); 

theApp = {
   
    
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
            case "arm":    
                img = "images_b/5.bmp";
                break; 
            case "arm1cut":    
                img = "images_b/6.bmp";
                break; 
            case "arm2cut":    
                img = "images_b/7.bmp";
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

        res.selectedId = document.querySelector('input[name="frameShape"]:checked').value;
         
        return res;
    },
                
    generateSettingsFileContent: function() {
        // return a string that is the settings file.
        return "I am a temporary dummy string";
    
    },    
                
    OnGenSettings: function() {
    
        var settings = theApp.generateSettingsFileContent();
                
        settings = settings.replace(/\n\r?/g, '<br />');
        var stat = document.getElementById("status");
        stat.innerHTML = settings;
    },
    
    OnExportSettings: function() {
    
        var content = theApp.OnGenSettings();
        this.exportToFile(content, "settingsFile.sbp");
        
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

