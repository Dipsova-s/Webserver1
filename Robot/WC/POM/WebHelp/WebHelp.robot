*** Keywords ***
Initialize WebHelp
    [Arguments]    ${directory}
    Create Directory     ${directory}
    Empty Directory      ${directory}
    Set Suite Variable    ${WEB_HELP_OUTPUT}    ${directory}
    Set Suite Variable    ${CROP_MARGIN}    0

Initialize WC WebHelp
    Initialize WebHelp    ${WC_HELP_IMAGE_PATH}
    Go to WC Then Login With Admin User

Initialize MC WebHelp
    Initialize WebHelp    ${MC_HELP_IMAGE_PATH}
    Go to MC Then Login With Admin User

Crop WebHelp Image
    [Arguments]    ${filename}    ${selector}
    File Should Not Exist    ${WEB_HELP_OUTPUT}/${filename}
    Capture and crop page screenshot    ${filename}    ${selector}
    Copy File    ${OUTPUT_DIR}/${filename}    ${WEB_HELP_OUTPUT}

Crop WebHelp Image With Dimensions
    [Arguments]    ${filename}    ${selector}    ${left}    ${top}    ${width}    ${height}
    Crop WebHelp Image    ${filename}    ${selector}
    @{dimensions}     Execute JavaScript    return [${left},${top},${width},${height}];
    Crop Image        ${WEB_HELP_OUTPUT}    ${filename}    @{dimensions}

Highlight WebHelp Element
    [Documentation]     Create border box by using javascript
    ...
    ...                 # Minify at http://javascriptcompressor.com/
    ...                 (function(){
    ...                     var element = $('${jQuerySelector}');
    ...                     var text = '${text}';
    ...                     var fontColor = '${fontColor}';
    ...                     var fontSize = '${fontSize}';
    ...                     var fontWeight = '${fontWeight}';
    ...                     var boxder = '${boxder}';
    ...                     var boxStyle = 'position:absolute;z-index:100000;box-sizing:border-box;border:'+boxder+';color:'+fontColor+';font-size:'+fontSize+';font-weight:'+fontWeight+';';
    ...                     var box = $('<div robot-box style="'+boxStyle+'"><span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">'+text+'</span></div>').appendTo('body');
    ...                     box.css(element.offset()).css({width:element.outerWidth(),height:element.outerHeight()});
    ...                 })();
    [Arguments]    ${selector}   ${text}=${EMPTY}    ${border}=3px solid #ff0000    ${fontColor}=#ff0000    ${fontSize}=30px    ${fontWeight}=bold
    ${jQuerySelector}    Get JQuery Selector    ${selector}
    Execute JavaScript    (function(){var a=$('${jQuerySelector}');var b='${text}';var c='${fontColor}';var d='${fontSize}';var e='${fontWeight}';var f='${border}';var g='position:absolute;z-index:100000;box-sizing:border-box;border:'+f+';color:'+c+';font-size:'+d+';font-weight:'+e+';';var h=$('<div robot-box style="'+g+'"><span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">'+b+'</span></div>').appendTo('body');h.css(a.offset()).css({width:a.outerWidth(),height:a.outerHeight()})})();

Clear WebHelp Highlights
    Execute JavaScript    $('[robot-box]').remove();

Drag List Display Column To Drop Column Area
    [Documentation]     Drag column of list Display to drop zone
    ...
    ...                 # Minify at http://javascriptcompressor.com/
    ...                 (function(){
    ...                     var target=$('${jQuerySelector}');
    ...                     var offset={ left: ${left}, top: ${top} };
    ...                     var grid=$('#AngleGrid').data('kendoGrid');
    ...                     var hint=grid._draggableInstance.options.hint(target).css(offset).appendTo('body');
    ...                     grid._draggableInstance.hint=hint;
    ...                     grid._draggableInstance.currentTarget = target;
    ...                     grid._draggableInstance.trigger('dragstart', { x: { location: 0 } });
    ...                     grid._draggableInstance.trigger('drag', { x: { loaction: 0 }, y: { location: 0 }});
    ...                 })();
    [Arguments]    ${selector}    ${left}=275    ${top}=60
        ${jQuerySelector}    Get JQuery Selector    ${selector}
        Execute JavaScript    (function(){var a=$('${jQuerySelector}'),t={left:${left},top:${top}},e=$('#AngleGrid').data('kendoGrid'),n=e._draggableInstance.options.hint(a).css(t).appendTo('body');e._draggableInstance.hint=n,e._draggableInstance.currentTarget=a,e._draggableInstance.trigger('dragstart',{x:{location:0}}),e._draggableInstance.trigger('drag',{x:{loaction:0},y:{location:0}})})();

Clear Dragging List Display Column
    [Documentation]     Drag column of list Display to drop zone
    ...
    ...                 # Minify at http://javascriptcompressor.com/
    ...                 (function(){
    ...                     var grid=$('#AngleGrid').data('kendoGrid');
    ...                     grid._draggableInstance.trigger('dragend', { y: { location: 1000 } });
    ...                     grid._draggableInstance.hint.remove();
    ...                 })();
    Execute JavaScript    (function(){var a=$('#AngleGrid').data('kendoGrid');a._draggableInstance.trigger('dragend',{y:{location:1e3}}),a._draggableInstance.hint.remove()})();
