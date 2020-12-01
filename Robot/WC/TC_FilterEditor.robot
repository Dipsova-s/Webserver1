*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Close Browser
Test Teardown       Go to Search Page
Force Tags          acc_wc   

*** Test Cases ***
Verify Add Filter
    [Documentation]     Verify all default operator and value when add the filter
    [Tags]      TC_C196803
    [Setup]  Import Angle By API  /models/1  ANGLE_For_Verify_Field_Types.json  user=${Username}
    Find Angle By ID Then Execute The First Angle    ROBOT_ANGLE_FOR_VERIFY_FIELD_TYPES
    Set Editor Context: Display Tab
    
    Click Display Tab

    # Currency
    Verify Add Filter Currency Editor
    # Date
    Verify Add Filter Date Editor
    # Number
    Verify Add Filter Number Editor
    # Percentage
    Verify Add Filter Percentage Editor
    # Set
    Verify Add Filter Set Editor
    # Text
    Verify Add Filter Text Editor
    # Time
    Verify Add Filter Time Editor
    # TimeSpan
    Verify Add Filter TimeSpan Editor
    # TimeStamp
    Verify Add Filter TimeStamp Editor
    # Boolean
    Verify Add Filter Boolean Editor
    
    [Teardown]  Clean Up Items And Go To Search Page

Verify Edit Filter Operator    
    [Documentation]     Verify the operator when edit the filter
    [Tags]      TC_C196803    
    [Setup]  Import Angle By API  /models/1  ANGLE_DisplayWithAllFilterEditors.json  user=${Username}
    Find Angle By ID Then Execute The First Angle    ROBOT_DISPLAY_WITH_ALL_FILTER_EDITORS
    Set Editor Context: Display Tab
    
    Click Display Tab
    #Boolean
    Verify Edit Filter Boolean Operator
    #Currency
    Verify Edit Filter Currency Operator
    #Date
    Verify Edit Filter Date Operator
    #DateTime
    Verify Edit Filter DateTime Operator
    #Double
    Verify Edit Filter Double Operator
    #Enumerated
    Verify Edit Filter Enumerated Operator
    #Int
    Verify Edit Filter Int Operator 
    #Percentage
    Verify Edit Filter Percentage Operator
    #Period
    Verify Edit Filter Period Operator
    #Text
    Verify Edit Filter Text Operator
    #Time
    Verify Edit Filter Time Operator
    #Timespan
    Verify Edit Filter Timespan Operator

    [Teardown]  Clean Up Items And Go To Search Page

Verify Edit Execution Parameter     
    [Documentation]     Verify the execution parameter when edit the filter
    [Tags]      TC_C196803
    [Setup]  Import Angle By API  /models/1  ANGLE_DisplayWithAllFilterEditors.json  user=${Username}
    Find Angle By ID Then Execute The First Angle    ROBOT_DISPLAY_WITH_ALL_FILTER_EDITORS
    Set Editor Context: Display Tab

    Click Display Tab
    Verify Edit Execution Parameter
 
    [Teardown]  Clean Up Items And Go To Search Page

Verify Edit Filter Value     
    [Documentation]     Verify the value when edit the filter
    [Tags]      TC_C196803
    [Setup]  Import Angle By API  /models/1  ANGLE_DisplayWithAllFilterEditors.json  user=${Username}
    Find Angle By ID Then Execute The First Angle    ROBOT_DISPLAY_WITH_ALL_FILTER_EDITORS
    Set Editor Context: Display Tab

    Click Display Tab
    #Boolean
    Verify Edit Boolean Filter Value
    #Currency
    Verify Edit Currency Filter Value
    #Date
    Verify Edit Date Filter Value    
    #Datetime
    Verify Edit DateTime Filter Value
    #Double
    Verify Edit Double Filter Value
    #Enumerate
    Verify Edit Enumerate Filter Value
    #Int
    Verify Edit Int Filter Value
    #Percentage
    Verify Edit Percentage Filter Value
    #Period
    Verify Edit Period Filter Value
    #Text
    Verify Edit Text Filter Value
    #Time
    Verify Edit Time Filter Value
    #Timespan
    Verify Edit Timespan Filter Value

    [Teardown]  Clean Up Items And Go To Search Page


Verify Dashboard Add Filter
    [Documentation]     Verify all dashboard default filter operators
    [Tags]      TC_C228833
    #arrange
    [Setup]  Import Dashboard By API  /models/1  DASHBOARD_Empty_Fillters.json  DASHBOARD_Empty_Fillters.angles.json  user=${Username}
    Find Dashboard By ID Then Execute The First Dashboard  ROBOT_DASHBOARD_Empty_Filters
    Click Dashboard Tab
    Set Editor Context: Dashboard Tab

    # Currency
    Verify Add Filter Currency Editor
    # Date
    Verify Add Filter Date Editor
    # Number
    Verify Add Filter Number Editor
    # Percentage
    Verify Add Filter Percentage Editor
    # Set
    Verify Add Filter Set Editor
    # Text
    Verify Add Filter Text Editor
    # Time
    Verify Add Filter Time Editor
    # TimeSpan
    Verify Add Filter TimeSpan Editor
    # TimeStamp
    Verify Add Filter TimeStamp Editor
    # Boolean
    Verify Add Filter Boolean Editor
    
    [Teardown]  Clean Up Items And Go To Search Page

Verify Dashboard Edit Filter Operator    
    [Documentation]     Verify the operators when edit dashboard filter
    [Tags]      TC_C228833    
    [Setup]  Import Dashboard By API  /models/1  DASHBOARD_Fillters.json  DASHBOARD_Fillters.angles.json  user=${Username}
    Find Dashboard By ID Then Execute The First Dashboard  ROBOT_DASHBOARD_Filters
    Click Dashboard Tab
    Set Editor Context: Dashboard Tab

    #Boolean
    Verify Edit Filter Boolean Operator
    #Currency
    Verify Edit Filter Currency Operator
    #Date
    Verify Edit Filter Date Operator
    #DateTime
    Verify Edit Filter DateTime Operator
    #Double
    Verify Edit Filter Double Operator
    #Enumerated
    Verify Edit Filter Enumerated Operator
    #Int
    Verify Edit Filter Int Operator 
    #Percentage
    Verify Edit Filter Percentage Operator
    #Period
    Verify Edit Filter Period Operator
    #Text
    Verify Edit Filter Text Operator
    #Time
    Verify Edit Filter Time Operator
    #Timespan
    Verify Edit Filter Timespan Operator

    [Teardown]  Clean Up Items And Go To Search Page    

Verify Dashboard Edit Filter Value     
    [Documentation]     Verify the value when edit dashboard filter
    [Tags]      TC_C228833
    [Setup]  Import Dashboard By API  /models/1  DASHBOARD_Fillters.json  DASHBOARD_Fillters.angles.json  user=${Username}
    Find Dashboard By ID Then Execute The First Dashboard  ROBOT_DASHBOARD_Filters
    Click Dashboard Tab
    Set Editor Context: Dashboard Tab
    
    #Boolean
    Verify Edit Boolean Filter Value
    #Currency
    Verify Edit Currency Filter Value
    #Date
    Verify Edit Date Filter Value    
    #Datetime
    Verify Edit DateTime Filter Value
    #Double
    Verify Edit Double Filter Value
    #Enumerate
    Verify Edit Enumerate Filter Value
    #Int
    Verify Edit Int Filter Value
    #Percentage
    Verify Edit Percentage Filter Value
    #Period
    Verify Edit Period Filter Value
    #Text
    Verify Edit Text Filter Value
    #Time
    Verify Edit Time Filter Value
    #Timespan
    Verify Edit Timespan Filter Value

    [Teardown]  Clean Up Items And Go To Search Page