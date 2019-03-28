*** Keywords ***
Initialize WebHelp
    [Arguments]    ${directory}
    Create Directory     ${directory}
    Empty Directory      ${directory}
    Set Suite Variable    ${WEB_HELP_OUTPUT}    ${directory}
    Restore Crop Margin

Set Crop Margin
    [Arguments]    ${margin}
    Set Suite Variable    ${CROP_MARGIN}    ${margin}

Restore Crop Margin
    Set Crop Margin    1

Get Images In Test Scenario
    [Arguments]    ${robotFile}
    ${text}    Get File    ${robotFile}
    ${result}    Get Lines Matching Regexp    ${text}    ^(\\s*Crop WebHelp Image)    partial_match=true
    @{lines}    Split To Lines    ${result}
    @{images}    Create List
    :FOR    ${line}    IN    @{lines}
    \    ${matches}    Get Regexp Matches     ${line}    \\w+\.png
    \    Append To List   ${images}    @{matches}[0]
    [Return]    ${images}

Get WebHelp Output Folder
    [Arguments]    ${languageDependent}=${True}
    ${output}    Set Variable If   ${languageDependent} == True    ${WEB_HELP_LANGUAGE_OUTPUT}    ${WEB_HELP_OUTPUT}
    [Return]    ${output}

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

Crop WebHelp Image
    [Arguments]    ${filename}    ${selector}    ${languageDependent}=${True}
    ${output}    Get WebHelp Output Folder   ${languageDependent}
    Capture and crop page screenshot    ${filename}    ${selector}
    Copy File    ${OUTPUT_DIR}${/}${filename}    ${output}

Crop WebHelp Image With Dimensions
    [Arguments]    ${filename}    ${selector}    ${left}    ${top}    ${width}    ${height}    ${languageDependent}=${True}
    Crop WebHelp Image    ${filename}    ${selector}    ${languageDependent}
    ${output}    Get WebHelp Output Folder   ${languageDependent}
    @{dimensions}     Execute JavaScript    return [${left},${top},${width},${height}];
    Crop Image        ${output}    ${filename}    @{dimensions}

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
