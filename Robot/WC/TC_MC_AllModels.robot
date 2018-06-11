*** Settings ***
Resource                    ${EXECDIR}/resources/WCSettings.robot
Suite Setup                 Open Browser in Sandbox Mode
Suite Teardown              Close Browser
Test Setup                  Go To               ${URL_MC}
Test Teardown               Logout MC
Force Tags                  acc_mc_s

*** Variables ***
${MODELS_ID}                EA3_800
${MODELS_SHORTNAME}         EA3_800_TEST
${MODELS_NAME}              EA3_800_TEST
${MODELS_ENVIRONMENT}       TEST
${MODELS_AGENT_URI}         http://th-eatst02.theatst.org:23005/
${MODELS_LICENSE_TYPE}      SAPSCM

#The Variables For Test SQLModelServer(EA4IT)
${SQLMODEL_ID}              EA4IT
${ROLE_ID}                  EA4IT_ALL
${USER_EA4IT}               EAAdmin

#Keyword To Verify Report Filter
${Keyword}                  WAERS__TCURC

*** Test Cases ***
#The EA3_800 model doesn't use anymore, remove test case
#Test Models
    #Login To MC By Admin User
    #Go To All Models Page
    #Verify License Type by ID    EA2_800    ${MODELS_LICENSE_TYPE}
    #Add New Models And Save     ${MODELS_ID}    ${MODELS_SHORTNAME}    ${MODELS_NAME}    ${MODELS_ENVIRONMENT}    ${MODELS_AGENT_URI}
    #Go To    ${URL_MC}
    #Wait Until Page Contains     Admin login
    #Login To MC By Admin User
    #Go To All Models Page
    #Verify Models After Added    ${MODELS_ID}
    #Delele Models by ID    ${MODELS_ID}
    #Sleep    1s
    #Go To    ${URL_MC}
    #Wait Until Page Contains     Admin login
    #Login To MC By Admin User
    #Go To All Models Page
    #Verify Models After Delele    ${MODELS_ID}

Test SQLModelServer(EA4IT)
    Login To MC By Admin User
    Go To All Models Page
    Verify Model EA4IT Is Present    ${SQLMODEL_ID}
    Click Side Menu Models EA4IT
    Verify Menu Item Under EA4IT Are Not Present
    Verify Role EA4IT_ALL Is Available    ${ROLE_ID}
    Verify EAAdmin User Has Role EA4IT    ${USER_EA4IT}    ${ROLE_ID}

Test Status And Report Button On Model Page
    Login To MC By Admin User
    Wait Until Overview Page Loaded
    Go To EA2_800 Models Page
    Verify Status And Report Button
    Verify Model Server Report Filter    ${Keyword}
    Verify Popup Stop Server