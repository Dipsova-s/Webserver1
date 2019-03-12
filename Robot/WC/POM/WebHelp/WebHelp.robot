*** Keywords ***
Initialize WebHelp
    [Arguments]    ${directory}
    Create Directory     ${directory}
    Empty Directory      ${directory}
    Set Suite Variable    ${WEB_HELP_OUTPUT}    ${directory}
    Set Suite Variable    ${CROP_MARGIN}    0

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
    [Documentation]     Create border box by using javascript
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

Drag List Display Column To Drop Column Area
    [Documentation]     Drag column of list Display to drop zone
    [Arguments]    ${selector}    ${left}=275    ${top}=60
    ${jQuerySelector}    Get JQuery Selector    ${selector}
    Execute JavaScript
    ...    (function(){
    ...        var target=$('${jQuerySelector}');
    ...        var offset={ left: ${left}, top: ${top} };
    ...        var grid=$('#AngleGrid').data('kendoGrid');
    ...        var hint=grid._draggableInstance.options.hint(target).css(offset).appendTo('body');
    ...        grid._draggableInstance.hint=hint;
    ...        grid._draggableInstance.currentTarget = target;
    ...        grid._draggableInstance.trigger('dragstart', { x: { location: 0 } });
    ...        grid._draggableInstance.trigger('drag', { x: { loaction: 0 }, y: { location: 0 }});
    ...    })();

Clear Dragging List Display Column
    [Documentation]     Drag column of list Display to drop zone
    Execute JavaScript
    ...    (function(){
    ...        var grid=$('#AngleGrid').data('kendoGrid');
    ...        grid._draggableInstance.trigger('dragend', { y: { location: 1000 } });
    ...        grid._draggableInstance.hint.remove();
    ...    })();
