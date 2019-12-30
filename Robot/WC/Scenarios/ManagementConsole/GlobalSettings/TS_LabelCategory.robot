*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/GlobalSettings/LabelCategory/LabelCategories.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/GlobalSettings/LabelCategory/EditLabelCategories.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Overview.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Models/Labels.robot

*** Keywords ***
Go To Label Category Setting Page
    Go To MC Page    /Global%20settings/Label%20categories/
    Wait Until Label Categories Page Loaded

Create Label Category Setting
    [Arguments]    ${labelCategoryName}
    Click Add New Label Category    ${labelCategoryName}
    Add Or Edit Label Category ID    ${labelCategoryName}
    Add Or Edit Label Category English    ${labelCategoryName}
    Add Or Edit Label Category German    ${labelCategoryName}
    Add Or Edit Label Category Spanish    ${labelCategoryName}
    Add Or Edit Label Category French    ${labelCategoryName}
    Add Or Edit Label Category Dutch    ${labelCategoryName}
    Click Save New Label Category

Add Label
    [Arguments]    ${labelName}
    Click Add New Label
    Add Abbreviation To Label    ${labelName}
    Add English Label    ${labelName}
    Add German Label    ${labelName}
    Add Spanish Label    ${labelName}
    Add French Label    ${labelName}
    Add Dutch Label    ${labelName}
    Click Save Edit Label Category
	
Edit Invalid Label
    [Arguments]    ${abbreviation}    ${labelName}
    Edit Label Abbreviation    ${abbreviation}    ${labelName}
    Click Save Invalid Label     ${abbreviation} 		
	Wait Until Validation Message Shown    ${abbreviation}

Delete Label Category Setting
    [Arguments]    ${labelCategoryName}
    Click Action Dropdown Label Category By ID    ${labelCategoryName}
    Click Delete Label Category By ID    ${labelCategoryName}
    Click Confirm Delete Label Category

Verify Label Category data
    [Arguments]    ${labelCategoryName}    ${labelName}     
    Verify Each Data of Label Category    ${labelCategoryName}    ${labelName}

Verify Existence Of Label Category
    [Arguments]     ${expectedLabelCategoryName}
    Verify Category Data      ${expectedLabelCategoryName}

Verify Existence Of Labels
    [Arguments]     ${expectedlabelName}
    Verify Labels Data      ${expectedlabelName}

Verify Filter
    [Arguments]    ${labelCategoryName}    ${labelName}
    Verify Filtering    ${labelCategoryName}    ${labelName}    

Check Active, Valid And Required Checkboxes
    [Arguments]    ${labelCategoryName}
    Selecting Checkboxes    ${labelCategoryName}

Uncheck Required, Valid and Active Checkboxes
    [Arguments]    ${labelCategoryName}
    Unselecting Checkboxes     ${labelCategoryName}

Verify the Reordering of Label Categories
    [Arguments]     ${labelCategoryName}
    Verify Reordering       ${labelCategoryName}
    



