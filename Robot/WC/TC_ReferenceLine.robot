*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With Admin User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go To Search Page       
Force Tags          acc_wc


*** Test Cases ***
Validate 'Clear All' Functionality of Reference line 
    [Tags]   TC_C231428
    [Documentation]     Validate 'Clear All' Functionality of Reference line
      
    Search By Text And Expect In Search Result    Angle For General Test
    Click Link First Item From Search Result
    Select Display Dropdown By Name    Test Chart 1
    Click Display Tab
    Click Field In Data Area By Field Index  1
    Click Field Setting Reference Line
    Enter Numbers in FROM text field  9555     
    Enter Numbers in TO text field   9556
    Click on 'Clear all' Button
    Validate "From" input values are cleared
    Validate "To" input values are cleared
    Validate "To" input field is disabled
    Validate TO unit selector(if present) reset back to the default unit
    Validate Clear All button is disabled

Validate color and opacity of the reference line and band  
    [Tags]   TC_C231428
    [Documentation]     Validate color and opacity of the reference line and band 

    Search By Text And Expect In Search Result    Angle For General Test
    Click Link First Item From Search Result
    Select Display Dropdown By Name    Test Chart 1
    Click Display Tab
    Click Field In Data Area By Field Index  1
    Click Field Setting Reference Line
    Enter Numbers in FROM text field  20000  
    Validate Color selector and Opacity input field is enabled
    Select Color in Color selector   rgb(63, 72, 204)
    Validate selected color appears in Color selector
    Click on 'Clear all' Button
    Validate Color selector and Opacity input field is disabled 
    Validate default color should be black
    Validate default Opacity should be 75%

    
