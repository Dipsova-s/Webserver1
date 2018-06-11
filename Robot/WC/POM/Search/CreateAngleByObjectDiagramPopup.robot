*** Variables ***

${divObjectDiagramDescriptionSection}    css=#Angle > div.Description > div.helpTextContainer
${divObjectDiagramSchemaGridSection}    css=#Schema
${divObjectDiagramBusinessProcessBarSection}    css=#NewAngleBySchema
${btnObjectDiagramBack}    btn-popupCreateNewAngleBySchema2
${btnObjectDiagramCreateAngle}    btn-popupCreateNewAngleBySchema0

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
    Wait Until Ajax Complete
    Wait Create Angle Popup Option Object Diagram Loaded

Click Back Create Angle Popup Option Object Diagram Loaded
    Click Link    ${btnObjectDiagramBack}