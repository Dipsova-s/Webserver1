*** Keywords ***
Initialize WebHelp
    [Arguments]    ${directory}
    Create Directory     ${directory}
    Empty Directory      ${directory}
    Set Suite Variable    ${WEBHELP_OUTPUT}    ${directory}
    Restore Crop Margin

Set Crop Margin
    [Arguments]    ${margin}
    Set Suite Variable    ${CROP_MARGIN}    ${margin}

Restore Crop Margin
    Set Crop Margin    1

Resize WebHelp Window
    [Arguments]  ${width}  ${height}
    Set Window Size    ${width}  ${height}
    Sleep  ${TIMEOUT_LARGEST}

Maximize WebHelp Window
    Resize WebHelp Window    ${WINDOW_WIDTH}   ${WINDOW_HEIGHT}

Get WebHelp Output Folder
    [Arguments]    ${languageDependent}=${True}
    ${output}    Set Variable If   ${languageDependent} == True    ${WEBHELP_LANGUAGE_OUTPUT}    ${WEBHELP_OUTPUT}
    [Return]    ${output}

Get Localization Text
    [Arguments]    ${en}  ${nl}  ${de}  ${es}  ${fr}
    ${text}   Set Variable If
    ...   '${WEBHELP_LANGUAGE_CODE}'=='nl'    ${nl}
    ...   '${WEBHELP_LANGUAGE_CODE}'=='de'    ${de}
    ...   '${WEBHELP_LANGUAGE_CODE}'=='es'    ${es}
    ...   '${WEBHELP_LANGUAGE_CODE}'=='fr'    ${fr}    ${en}
    [Return]    ${text}

Update Popup Position
    [Arguments]    ${selector}
    ${jQuerySelector}    Get JQuery Selector    ${selector}
    Execute JavaScript
    ...    var element=$('${jQuerySelector}');
    ...    var offset=element.offset();
    ...    var newLeft=Math.round(offset.left/2)*2;
    ...    var newTop=Math.round(offset.top/2)*2;
    ...    var newOffset={left:newLeft,top:newTop};
    ...    element.offset(newOffset);

Copy Image To Webhelp Folder
    [Arguments]    ${path}    ${languageDependent}=${True}
    ${output}    Get WebHelp Output Folder   ${languageDependent}
    Copy File    ${WEBHELP_ITEMS_PATH}${/}${path}    ${output}

Get WebHelp Image Name
    [Arguments]    ${filename}    ${languageDependent}=${True}
    ${imageName}  Run Keyword If  ${languageDependent}==${True} and '${WEBHELP_LANGUAGE_CODE}'!='en'  Replace String  ${filename}  .png  -${WEBHELP_LANGUAGE_CODE}.png
    ...             ELSE  Set variable  ${filename}
    [Return]  ${imageName}

Crop WebHelp Image
    [Arguments]    ${filename}    ${selector}    ${languageDependent}=${True}
    ${output}    Get WebHelp Output Folder   ${languageDependent}
    Execute JavaScript  $('#tooltip').hide();
    ${imageName}  Get WebHelp Image Name  ${filename}  ${languageDependent}
    Capture and crop page screenshot    ${imageName}    ${selector}
    Copy File    ${OUTPUT_DIR}${/}${imageName}    ${output}

Crop WebHelp Image With Dimensions
    [Arguments]    ${filename}    ${selector}    ${left}    ${top}    ${width}    ${height}    ${languageDependent}=${True}
    Crop WebHelp Image    ${filename}    ${selector}    ${languageDependent}
    ${output}    Get WebHelp Output Folder   ${languageDependent}
    ${imageName}  Get WebHelp Image Name  ${filename}  ${languageDependent}
    @{dimensions}     Execute JavaScript    return [${left},${top},${width},${height}];
    Crop Image        ${output}    ${imageName}    @{dimensions}

Highlight WebHelp Element
    [Arguments]    ${selector}   ${text}=${EMPTY}    ${textPosition}=center    ${border}=3px solid #ff0000    ${fontColor}=#ff0000    ${fontSize}=30px    ${fontWeight}=bold
    ${jQuerySelector}    Get JQuery Selector    ${selector}
    Execute javascript
    ...    (function(){
    ...        var element = $('${jQuerySelector}');
    ...        var text = '${text}';
    ...        var fontColor = '${fontColor}';
    ...        var fontSize = '${fontSize}';
    ...        var fontWeight = '${fontWeight}';
    ...        var border = '${border}';
    ...        var textPosition = !'${textPosition}'||'${textPosition}'=='center'?'top:50%;left:50%;transform:translate(-50%,-50%);':'${textPosition}';
    ...        var boxStyle = 'position:absolute;z-index:100000;box-sizing:border-box;border:'+border+';color:'+fontColor+';font-size:'+fontSize+';font-weight:'+fontWeight+';';
    ...        var box = $('<div robot-box style="'+boxStyle+'"><span style="position:absolute;line-height:normal;'+textPosition+'">'+text+'</span></div>').appendTo('body');
    ...        box.css(element.offset()).css({width:element.outerWidth(),height:element.outerHeight()});
    ...    })();

Update Heightlight Box
    [Arguments]   ${property}  ${value}
    Execute javascript
    ...     var box = $('[robot-box]:last');
    ...     var properties = $.extend(box.offset(), { width: box.outerWidth(), height: box.outerHeight() });
    ...     box.css('${property}', properties['${property}'] + ${value});

Clear WebHelp Highlights
    Execute JavaScript    $('[robot-box]').remove();

Drag WebHelp Element To Location
    [Arguments]    ${draggableSelector}   ${elementSelector}  ${handleClass}=${EMPTY}    ${left}=0    ${top}=0
    ${draggable}    Get JQuery Selector    ${draggableSelector}
    ${element}    Get JQuery Selector    ${elementSelector}
    Execute JavaScript
    ...    (function(){
    ...        var target=$('${element}');
    ...        var handle=$('${element} ${handleClass}');
    ...        var offset=target.offset();
    ...        offset.left+=${left};
    ...        offset.top+=${top};
    ...        var css={position:'absolute','z-index':100000,left:offset.left,top:offset.top};
    ...        var draggable=$('${draggable}').data('kendoDraggable');
    ...        var hint=draggable.options.hint(target).css(css).appendTo('body');
    ...        draggable.hint=hint;
    ...        draggable.currentTarget=target;
    ...        draggable.trigger('dragstart', { x: { location: 0 }, currentTarget: target, initialTarget: handle });
    ...        draggable.trigger('drag', { x: { loaction: 0 }, y: { location: 0 }});
    ...    })();

Clear Dragging WebHelp Element
    [Arguments]    ${draggableSelector}
    ${draggable}    Get JQuery Selector    ${draggableSelector}
    Execute JavaScript
    ...    (function(){
    ...        var draggable=$('${draggable}').data('kendoDraggable');
    ...        draggable.trigger('dragend', { y: { location: 1000 } });
    ...        draggable.hint.remove();
    ...    })();

Create WebHelp Box
    [Arguments]    ${selector}    ${style}={}
    ${element}    Get JQuery Selector    ${selector}
    Execute JavaScript
    ...   var element=$('${element}');
    ...   var css = $.extend({position:'absolute','z-index':10000}, element.offset(), { width: element.outerWidth(), height: element.outerHeight() }, ${style});
    ...   $('<div id="RobotBox" />').css(css).appendTo('body');

Clear WebHelp Box
    Execute JavaScript  $('#RobotBox').remove();

Image To Base64
    [Arguments]  ${image}
    ${pngHeader}  Set Variable  data:image/png;base64,
    ${binary}  Get Binary File  ${image}
    ${base64Image}  Evaluate  base64.b64encode($binary)  modules=base64
    [Return]  ${pngHeader}${base64Image}