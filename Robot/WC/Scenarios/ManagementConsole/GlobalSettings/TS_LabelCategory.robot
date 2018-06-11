*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/GlobalSettings/LabelCategory/LabelCategories.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/GlobalSettings/LabelCategory/EditLabelCategories.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Overview.robot

*** Keywords ***
Go To Label Category Setting Page
    Wait Side Menu Ready
    Click Side Menu Global Settings
    Click Side Menu Label Categories
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

Delete Label Category Setting
    [Arguments]    ${labelCategoryName}
    Click Action Dropdown Label Category By ID    ${labelCategoryName}
    Click Delete Label Category By ID    ${labelCategoryName}
    Click Confirm Delete Label Category
