*** Settings ***
Resource                  ${EXECDIR}/resources/WCSettings.robot
Suite Setup               Go To Refresh Cycle Page With Admin User
Suite Teardown            Close Browser
Test Teardown             Reload Refresh Cycle Page
Force Tags                MC    acc_mc

*** Test Cases ***
Refresh Cycle Form Test
    Check Field Elements


