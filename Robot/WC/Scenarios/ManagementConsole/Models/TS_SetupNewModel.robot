*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Models/SetupNewModel.robot

*** Keywords ***
Verify Setup New Model Form
    Check Model Id DropdownList
    Verify Model Color Picker
    Verify Model Short Name
    Verify Model Name
    Verify Model Environment
