*** Variables ***
${HelpIconWC}              id=HelpIcon
${HelpIconITMC}            id=HelpMenuControl
${SupportButtonText}     xpath=//a/span[text()='Support']
${SupportButton}         //a[@class='actionDropdownItem btnSupport']

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

Get Localization Text
    [Arguments]    ${en}  ${nl}  ${de}  ${es}  ${fr}
    ${text}   Set Variable If
    ...   '${WEB_HELP_LANGUAGE_CODE}'=='nl'    ${nl}
    ...   '${WEB_HELP_LANGUAGE_CODE}'=='de'    ${de}
    ...   '${WEB_HELP_LANGUAGE_CODE}'=='es'    ${es}
    ...   '${WEB_HELP_LANGUAGE_CODE}'=='fr'    ${fr}    ${en}
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
    Copy File    ${WEBHELP_ITEM_PATH}${/}${path}    ${output}

Get WebHelp Image Name
    [Arguments]    ${filename}    ${languageDependent}=${True}
    ${imageName}  Run Keyword If  ${languageDependent}==${True} and '${WEB_HELP_LANGUAGE_CODE}'!='en'  Replace String  ${filename}  .png  _${WEB_HELP_LANGUAGE_CODE}.png
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

Click on Help icon in WC
    Wait Until Ajax Complete
    Custom click element  ${HelpIconWC}

Click on Help icon in ITMC
    Wait Until Ajax Complete
    Custom click element  ${HelpIconITMC}

Validate Support button Should be displayed in WC
    Wait Until Ajax Complete
    # validate Support button is displayed
    page should contain element   ${SupportButtonText}   message=Support button is not displayed
    
Click on Support Button
    Custom click element  ${SupportButton}

Validate user is redirected to online support portal
    Select Window   title=Welcome to Magnitude’s Support Community | Magnitude Software   timeout=15s
    Wait Until Ajax Complete
    ${SupportUrl}=  Get Location
    should contain  ${SupportUrl}   https://magnitude.com/online-support/

Validate Support button Should be displayed in ITMC
    Wait Until Ajax Complete
    # validate Support button is displayed
    page should contain element   ${SupportButtonText}   message=Support button is not displayed

