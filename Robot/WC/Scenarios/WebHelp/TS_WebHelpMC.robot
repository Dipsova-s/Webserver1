*** Settings ***
Resource            ${EXECDIR}/WC/POM/WebHelp/WebHelp.robot

*** Keywords ***
Suite Setup MC WebHelp
    Initialize WebHelp    ${MC_HELP_IMAGE_PATH}

Test Setup MC WebHelp
    # output by specific language
    Set Test Variable    ${WEB_HELP_LANGUAGE_OUTPUT}    ${MC_HELP_IMAGE_PATH}

    # login
    Go to MC Then Login With Admin User

Test Teardown MC WebHelp
    Force Logout MC Then Close Browser

Set WebHelp Username
    Execute JavaScript    $('#UserMenuControl').contents().get(0).textContent='[USERNAME]';

Crop Overview Page
    Highlight WebHelp Element    css=#topWrapper        text=1    fontSize=45px    fontWeight=normal
    Highlight WebHelp Element    css=#sideContent       text=2    fontSize=45px    fontWeight=normal
    Highlight WebHelp Element    css=#mainContainer     text=3    fontSize=45px    fontWeight=normal
    Set WebHelp Username
    Execute JavaScript    var breadcrumbHeight=$('#breadcrumb').height();var box3=$('[robot-box]').eq(2);box3.css('top', box3.offset().top-breadcrumbHeight).css('height', box3.outerHeight()+breadcrumbHeight);
    Crop WebHelp Image    MC_Overview.png    css=body
    Clear WebHelp Highlights

Crop Custom Icons
    Go To Custom Icons Page
    Execute JavaScript    $('#FieldCategoryGrid .k-alt').removeClass('k-alt');
    Sleep   2s
    Crop WebHelp Image    EA_32.png    jquery=img[src*="EA_32.png"]
    Crop WebHelp Image    SAP_32.png    jquery=img[src*="SAP_32.png"]
    Crop WebHelp Image    reference_32.png    jquery=img[src*="Reference_32.png"]
    Crop WebHelp Image    GRC_32.png    jquery=img[src*="GRC_32.png"]
    Crop WebHelp Image    Fico_32.png    jquery=img[src*="FICO_32.png"]
    Crop WebHelp Image    balancing_32.png    jquery=img[src*="BALANCING_32.png"]

Crop Action Icons
    Go To Label Category Setting Page
    Execute JavaScript    $('#Grid tr').addClass('k-alt');
    Crop WebHelp Image    MC_ChangeOrder.png    jquery=#Grid .btnMove
    Crop WebHelp Image    MC_Edit.png    jquery=#Grid .btnGroupContainer
    Crop WebHelp Image With Dimensions    MC_Edit2.png    jquery=#Grid .btnGroupContainer    0    0    32    26

    Execute JavaScript    $('#Grid .btnGroupContainer > .btn').attr('class', 'btn btnDelete');
    Crop WebHelp Image With Dimensions    MC_Trashcan.png    jquery=#Grid .btnGroupContainer    0    0    32    26

    Execute JavaScript    $('#Grid .btnGroupContainer > .btn').attr('class', 'btn btnInfo');
    Sleep    1s
    Crop WebHelp Image With Dimensions    MC_Information.png    jquery=#Grid .btnGroupContainer    9    5    17    17

    Execute JavaScript    $('#Grid .btnGroupContainer > .btn').attr('class', 'btn btnSetActive');
    Sleep    1s
    Crop WebHelp Image    MC_Down.png    jquery=#Grid .btnGroupContainer

    Execute JavaScript    $('#Grid .btnGroupContainer > .btn').attr('class', 'btn btnOpenWindow');
    Sleep    1s
    Crop WebHelp Image    MC_View_More.png    jquery=#Grid .btnGroupContainer

    Execute JavaScript    $('#Grid .btnGroupContainer > .btn').attr('class', 'btn btnCopy');
    Sleep    1s
    Crop WebHelp Image With Dimensions    MC_Copy.png    jquery=#Grid .btnGroupContainer    0    0    32    26

Crop Model Overview Page
    Go To EA2_800 Model Overview Page
    Prepare Model Overview Page
    ${textPosition}    Set Variable    right:3px;top:0;
    Highlight WebHelp Element    css=#modelInfoStatus           1    ${textPosition}    fontSize=45px    fontWeight=normal
    Highlight WebHelp Element    css=#modelInfoOptions          2    ${textPosition}    fontSize=45px    fontWeight=normal
    Highlight WebHelp Element    css=.modelInfoSetup            3    ${textPosition}    fontSize=45px    fontWeight=normal
    Highlight WebHelp Element    css=.modelInfoLicense          4    ${textPosition}    fontSize=45px    fontWeight=normal
    Highlight WebHelp Element    css=.modelInfoInstance:eq(0)   5    ${textPosition}    fontSize=45px    fontWeight=normal
    Highlight WebHelp Element    css=.modelInfoInstance:eq(1)   6    ${textPosition}    fontSize=45px    fontWeight=normal
    ${width}    ${height}    Get Zoomed Element Size    css=#mainContainer    0.85
    Crop WebHelp Image With Dimensions    MC_Model_Status.png    css=#mainContainer    0    0    ${width}    ${height}
    Clear WebHelp Highlights
    Restore Model Overview Page

Prepare Model Overview Page
    # zoon out / hide top bar / set mainContent height
    Execute JavaScript    $('body').css('zoom', 0.85);
    ...                   $('#topWrapper').hide();
    ...                   $('#mainContent').height($('#mainContent .pageModelInfo').height());
    ...                   $('#sideContent').height($('#mainContainer').height());

Restore Model Overview Page
    # restore everything
    Execute JavaScript    $('body').css('zoom', '');
    ...                   $('#topWrapper').show();
    ...                   $(window).trigger('resize');

Crop Edit Automation Task Page
    Go To All Tasks Page
    Click Button To Add New Task
    Click Add Action Button
    Resize Kendo Popup height To    650
    Drag And Drop By Offset    jquery=#AddActionPopup ~ .k-resize-n    0    -40
    Select Dropdown Datastore    Export to CSV - Default
    Scroll Vertical To Element    jquery=#AddActionPopup .popupContent    jquery=#AddActionPopup .contentSectionInfo:eq(1)
    Input Datastore Filename    test_csv
    Select Datastore Append Result
    Crop WebHelp Image    MC_AutoTask_MacroField.png    jquery=#DatastoreSettings .dataSettings:eq(0)
    Enable Send Email Notification
    Enable Send Email Attach result
    Scroll Vertical    jquery=#AddActionPopup .popupContent    2000
    Add Task Action Email Notification    m.smith@everyangle.org    Select    Unselect    Unselect
    Input Task Action Email Description    <p>New daily export of {anglename}</p><p>Model timestamp: {modeltimestamp}</p><p>Displayname: {displayname}</p>
    Crop WebHelp Image With Dimensions    MC_AutoTask_MacroExample.png    jquery=#AddActionPopup .popupContent    0    2    700    600
    Copy Image To Webhelp Folder    images/MC_AutoTask_MacroResult.png