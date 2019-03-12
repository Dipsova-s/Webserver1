*** Settings ***
Resource            ${EXECDIR}/WC/POM/WebHelp/WebHelp.robot

*** Keywords ***
Suite Setup WC WebHelp
    Initialize WebHelp    ${WC_HELP_IMAGE_PATH}

Test Setup WC WebHelp
    [Arguments]    ${username}    ${password}    ${folder}
    # output by specific language
    ${directory}    Replace String    ${WC_HELP_IMAGE_PATH}    ${WEBHELP_COMMON_FOLDER}    ${folder}
    Create Directory     ${directory}
    Empty Directory      ${directory}
    Set Test Variable    ${WEB_HELP_LANGUAGE_OUTPUT}    ${directory}

    # login
    Open Browser in Sandbox Mode
    Go To    ${URL_WC}
    Login To WC    ${username}    ${password}

    ${width}   ${height}    Get Window Size
    Set Test Variable    ${WINDOW_WIDTH}    ${width}
    Set Test Variable    ${WINDOW_HEIGHT}    ${height}

Test Teardown WC WebHelp
    Logout WC Then Close Browser

Crop Create Angle Popup
    Click Create Angle Button
    Click Object Activity Diagram Button
    Crop WebHelp Image    wc_s2d_activitydiagram.png    css=.popupCreateNewAngleBySchema
    Click Back Button To Back To Create Angle Options
    Click Object Diagram Button
    Click P2P Business Processes On Create Angle Diagram Options
    Crop WebHelp Image    wc_p2p_objectdiagram.png    css=.popupCreateNewAngleBySchema
    Click Back Button To Back To Create Angle Options
    Click Object List Button
    Crop WebHelp Image    wc_object_list.png    css=.popupCreateNewAngle 

Crop Toggle Angle
    Search By Text And Expect In Search Result    Angle For General Test
    Open Angle From First Angle in Search Page    Angle For General Test
    Crop WebHelp Image    wc_expand_button.png    css=#ToggleAngle

Crop Delete Display Icon
    Search By Text And Expect In Search Result    Angle For General Test
    Open Angle From First Angle in Search Page    Angle For General Test
    Open Display Dropdown
    Execute JavaScript   $('#DisplayItemList .ItemList:not(.ItemListSelected) .btnDelete').show();
    Crop WebHelp Image    wc_delete_angle_icon.png    jquery=#DisplayItemList .ItemList:not(.ItemListSelected) .btnDelete

Crop Remove List Display Column
    Drag List Display Column To Drop Column Area    jquery=#AngleGrid [data-field="ObjectType"]
    Crop WebHelp Image With Dimensions  wc_drop.png  css=#MainContainer    0    0    1269    403
    Clear Dragging List Display Column

