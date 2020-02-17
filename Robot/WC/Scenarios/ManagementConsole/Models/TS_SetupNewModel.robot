*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Models/SetupNewModel.robot

*** Keywords ***
Verify Setup New Model Form
    Verify Model Short Name
    Verify Model Name
    Verify Model Environment

Create new Model
    Enter Model Short Name
    Enter Model Name
    Enter Model Environment
    Click Save Models

Verify the model created
    Verify model name is displayed in overview page

Edit Model
    Edit model details
    Click Edit Save Models

Verify the model modified
    Verify modified model name is displayed in overview page

Restore model
    Go To All Models Page
    Restore the content back to the same values
    Click Edit Save Models

Delete Model
    Click Delete Models By ID    AuthTest

Verify the model deleted
    Verify deleted model is not displayed in overview page


