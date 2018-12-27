*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Close Browser
Test Setup          Go To               ${URL_WC}
Test Teardown       Logout
Force Tags          Disabled

*** Test Cases ***
Verify Execute Jump Display
    Login To WC By Power User
    Search Filter By Item IDS    EA_CLASS_TPL_StorageLocation
    Check Existing Angle From Search Result    Storage Location
    Execute First Search Item In Edit Mode
    Change Display By Name    Basic List
    ${basicListColumnCount}    Get List Columns Count With No Warning
    Back To Search
    Create Adhoc Angle And Execute Jump    Material
    List Columns Should Be Equal To    ${basicListColumnCount}
    Back To Search
    Search Filter By Item IDS    EA_CLASS_TPL_StorageLocation
    Check Existing Angle From Search Result    Storage Location
    Execute First Search Item In Edit Mode
    Open Angle Popup And Save ID    EA_JUMP_TPL_Material
    ${defaultDisplayType}    Get Current Display Type
    Back To Search
    Create Adhoc Angle And Execute Jump    Material
    Display Type Should Be Equal To    ${defaultDisplayType}
    Back To Search
    Search Filter By Item IDS    EA_JUMP_TPL_Material
    Check Existing Angle From Search Result    Storage Location
    Execute First Search Item In Edit Mode
    Open Angle Popup And Save ID    EA_CLASS_TPL_StorageLocation_unused
    Back To Search
    Create Adhoc Angle And Execute Jump    Material
    First List Column Should Be    ID
    Back To Search
    Search Filter By Item IDS    EA_CLASS_TPL_StorageLocation_unused
    Check Existing Angle From Search Result    Storage Location
    Execute First Search Item In Edit Mode
    Open Angle Popup And Save ID    EA_CLASS_TPL_StorageLocation