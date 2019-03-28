*** Variables ***

${divObjectDiagramDescriptionSection}    css=#Angle > div.Description > div.helpTextContainer
${divObjectDiagramSchemaGridSection}    css=#Schema
${divObjectDiagramBusinessProcessBarSection}    css=#NewAngleBySchema
${btnObjectDiagramBack}    btn-popupCreateNewAngleBySchema2
${btnObjectDiagramCreateAngle}    btn-popupCreateNewAngleBySchema0
${pdDiagram}			css=#classid_area_purchasedocument

*** Keywords ***
Wait Create Angle Popup Option Object Diagram Loaded
    Wait Until Page Contains Element    ${divObjectDiagramDescriptionSection}
    Wait Until Page Contains Element    ${divObjectDiagramSchemaGridSection}
    Wait Until Page Contains Element    ${divObjectDiagramBusinessProcessBarSection}
    Wait Until Page Contains Element    ${btnObjectDiagramBack}
    Wait Until Page Contains Element    ${btnObjectDiagramCreateAngle}
    Wait Until Ajax Complete

Open Create Angle By Object Diagram Popup
    Click Create Angle Button
    Click Object Diagram Button

Click Back Create Angle Popup Option Object Diagram Loaded
    Click Link    ${btnObjectDiagramBack}


Click P2P Business Processes On Create Angle Diagram Options
	Click Element    ${p2pBusinessProcess}
	Wait Until Ajax Complete

Select A Diagram
	${jQuerySelector}    Get jQuery Selector    ${pdDiagram}
    Execute JavaScript    $('${jQuerySelector}').trigger('click');
	Wait Until Ajax Complete