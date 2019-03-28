*** Variables ***

${divActivityDiagramDescriptionSection}    css=#Angle > div.Description > div.helpTextContainer
${divActivityDiagramSchemaGridSection}    css=#Schema
${divActivityDiagramBusinessProcessBarSection}    css=#NewAngleBySchema
${btnActivityDiagramBack}    btn-popupCreateNewAngleBySchema2
${btnActivityDiagramCreateAngle}    btn-popupCreateNewAngleBySchema0

*** Keywords ***
Wait Create Angle Popup Option Activity Diagram Loaded
    Wait Until Page Contains Element    ${divActivityDiagramDescriptionSection}
    Wait Until Page Contains Element    ${divActivityDiagramSchemaGridSection}
    Wait Until Page Contains Element    ${divActivityDiagramBusinessProcessBarSection}
    Wait Until Page Contains Element    ${btnActivityDiagramBack}
    Wait Until Page Contains Element    ${btnActivityDiagramCreateAngle}
    Wait Until Ajax Complete

Open Create Angle By Activity Diagram Popup
    Click Create Angle Button
    Click Object Activity Diagram Button

Click Back Create Angle Popup Option Activity Diagram Loaded
    Click Link    ${btnActivityDiagramBack}

