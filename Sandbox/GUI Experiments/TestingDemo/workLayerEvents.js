// WORK LAYER EVENTS
/*
- on click
- on mousedown
- on contentMousemove
- on mouseover
- on mouseout
*/

/*
There are 3 different modes:
  1. WorkTool (users can navigate the menu, drag objects onto the board from the menu, drag
      objects around in the work layer, or render thumbnails)
  2. LineTool (users can connect different nodes by clicking on one, and connecting to an outlet
      on another)
  3. DeleteTool (users can remove unwanted functions, values, or lines from the workLayer)

  The default is workTool. 

  When making a line, form a connection on click if the click was on an outlet.
  Behind the scenes:
  1. if the object clicked was the source of the line, destroy the line.
  2. If the outlet already had a connection, make that connection null and destroy it
  --otherwise, this is connected to a new outlet so increment numInputs for the group
  3. set connections within the line and its outlet, so line has a reference to the 
  outlet, and the outlet has a reference to the line
  --make the line stick to the outlet
  --set makingLine = false
  --shrink the outlet back to its original size
  --check if we have enough outlets to show the render box
  4. if we have all visible outlets filled but the function can take more inputs, add
  an outlet.
  5. otherwise keep drawing the line.
  */
  workLayer.on('click', function(evt) {
    var shape = evt.target;
    var parent = shape.getParent();
    if (workToolOn) {
      if (isImageBox(shape)) {
        if (!shape.attrs.expanded) {
          renderCanvas(parent);
          shape.attrs.expanded = true;
        } else {
          shape.attrs.expanded = false;
          animation = false;
          setTimeout(function() {collapseCanvas(parent)}, 50);
        }
        setTimeout(function() {workLayer.draw()}, 50);
      }
    } else if (lineToolOn) {
      if (makingLine) {
        if (parent == currLine.attrs.source || isCycle(currLine.attrs.source, parent)) {
          currLine.attrs.source.attrs.lineOut.splice([currLine.attrs.source.attrs.lineOut.length - 1], 1);
          currLine.destroy();
          if (isOutlet(shape)) {
            shape.scale({ x: 1, y: 1 });
          }
          makingLine = false;
        } else if (isOutlet(shape)) {
      //check if outlet already has an input
      if (shape.attrs.lineIn != null) {
        //POSSIBLE NEED TO DESTROY LINE ITSELF
        var source = shape.attrs.lineIn.attrs.source;
        source.attrs.lineOut[shape.attrs.lineIn.attrs.sourceIndex].destroy();
        source.attrs.lineOut.splice([shape.attrs.lineIn.attrs.sourceIndex], 1);
      } else {
        parent.attrs.numInputs++;
      } // check if theres already a line going in to the outlet
      shape.attrs.lineIn = currLine;
      currLine.points()[2] = parent.x();
      currLine.points()[3] = parent.y() + shape.y();
      currLine.attrs.outlet = shape;
      makingLine = false;
      shape.scale({ x: 1, y: 1 });
      assertRenderable(parent);
      if (parent.attrs.numInputs == parent.children.length - OUTLET_OFFSET &&
        parent.attrs.numInputs < parent.attrs.maxInputs) {
        addOutlet(parent);
        if (parent.children[2].attrs.expanded) {
          renderCanvas(parent);
        }
      }
    updateForward(parent);
    } // if clicked on self, else clicked on a valid outlet
  } else {
    if (isImageBox(shape)) {
      if (!shape.attrs.expanded) {
        renderCanvas(parent);
        shape.attrs.expanded = true;
      } else {
        shape.attrs.expanded = false;
        animation = false;
        setTimeout(function() {collapseCanvas(parent)}, 50);
      }
      setTimeout(function() {workLayer.draw()}, 50);
    } else {
      makingLine = true;
      var group = evt.target.getParent();
      currLine = makeLine(group);
      group.attrs.lineOut[group.attrs.lineOut.length] = currLine;
      lineLayer.add(currLine);
    }
  }
} else if (deleteToolOn) {
  // deal with lines coming in to the node being deleted
  var group = parent;
  var targetLine;
  for(var i = 3; i < group.children.length; i++) {
    targetLine = group.children[i].attrs.lineIn;
    if(targetLine != null) {
      targetLine.attrs.outlet = null;
      targetLine.attrs.source.attrs.lineOut.splice(targetLine.attrs.sourceIndex, 1);
      targetLine.destroy();
    }
  }
  // deal with the lines leading out of the node being deleted
  var outletParent;
  for(var i = 0; i < group.attrs.lineOut.length; i++) {
    targetLine = group.attrs.lineOut[i];
    if (targetLine.attrs.outlet != null) {
      outletParent = targetLine.attrs.outlet.getParent();
      outletParent.attrs.numInputs--;
      targetLine.attrs.outlet.attrs.lineIn = null;
      assertRenderable(outletParent);
      updateForward(outletParent);
    }
    targetLine.destroy();
  }
  var render = group.attrs.renderLayer
  if (render != null) {
    render.destroy();
  }
  if (currShape == group) {
    console.log('here');
    currShape = undefined;
    funBarText.setAttr('text', '');
    funBarLayer.draw();
  }
  group.destroy();
}

workLayer.draw();
lineLayer.draw();
});

/*
  When you click down on an object in the workLayer and arent in the process of making
  a line, move that object to the dragLayer and allow it to be dragged.
  */
  workLayer.on('mousedown', function(evt) {
    if (workToolOn) {
      if (!isImageBox(evt.target)) {
        var group = evt.target.getParent();
        group.moveTo(dragLayer);
        if (currShape != undefined) {
         currShape.children[0].setAttr('shadowEnabled', false);
       }
       currShape = group
       currText = currShape.attrs.renderFunction;
       if (currText != null) {
        currShape.children[0].setAttrs({
          shadowColor: 'darkblue',
          shadowOpacity: 1,
          shadowEnabled: true
        });
        var currFontSize;
        if (currText.length <= 12) {
            currFontSize = funBarDisplayFontSize;
          } 
          else if (currText.length >= 26){
            currFontSize = 10;
          }
          else {
            currFontSize = 264 / currText.length;
          }
        funBarText.setAttrs({
          text: currText,
          fontSize: currFontSize
          });
        funBarLayer.draw();
      }
      group.startDrag();
      workLayer.draw();
      dragLayer.draw();

      if (group.attrs.renderLayer != null) {
        group.attrs.renderLayer.draw();
      }
    }
  } 
});

  /*
  while you are drawing a line, make it move with the cursor.
    */
  stage.addEventListener('contentMousemove', function(){
    if (makingLine) {
      currLine.points()[2] = stage.getPointerPosition().x;
      currLine.points()[3] = stage.getPointerPosition().y;
      lineLayer.draw();
    }
  });

  /*
  while making a line, make outlets grow when they are moused over to signify that they
  are valid connections
*/
workLayer.on('mouseover', function(evt) {
  var shape = evt.target;
  var parent = shape.parent;
  if (workToolOn || lineToolOn) {
    if (isImageBox(shape) && shape.attrs.expanded) {
      animation = true;
      var frame = function() {
        renderCanvas(shape.getParent());
        if (animation) {
          setTimeout(frame, 50);
        }
      }
      frame();
    }
    if (makingLine) {
      if (isOutlet(shape)) {
        shape.scale({
          x: 1.5,
          y: 1.5
        });
        workLayer.draw();
    } // if outlet
  } 
} 
else if (deleteToolOn) {
  if (isFunction(parent) || isValue(parent)) {
    parent.children[0].setAttrs({
      shadowColor: deleteColor,
      shadowOpacity: 1,
      shadowEnabled: true
    });
  }
  workLayer.draw();
}
});

/*
  when the cursor is moved out of an outlet while drawing a line, return it to its
  original size
  */
  workLayer.on('mouseout', function(evt) {
    var shape = evt.target;
    var parent = shape.getParent();
    if (workToolOn || lineToolOn) {
      if (isImageBox(shape) && shape.attrs.expanded) {
        animation = false;
      }
      if (makingLine) {
        if (isOutlet(shape)) {
          shape.scale({
            x: 1,
            y: 1
          });
          workLayer.draw();
        } //if outlet
      } //if makingLine
    } 
    else if (deleteToolOn) {
      if (isFunction(parent) || isValue(parent)) {
        if (parent == currShape){
          parent.children[0].setAttr('shadowColor', 'darkblue');
        } 
        else {
          parent.children[0].setAttrs({
            shadowEnabled: false
          });
        }
      }
      workLayer.draw();
    }
});