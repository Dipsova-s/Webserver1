*** Keywords ***
Set Server Context Variables
    Open Browser in Sandbox Mode
    Go To    ${URL_WC}
    Login To WC By Admin User
    ${url}    Execute JavaScript    return window.webAPIUrl;
    Set Suite Variable    ${CurrentServerUrl}    ${url}

    Go To    ${URL_WC_COMPARE}
    Login To WC By Admin User
    ${url}    Execute JavaScript    return window.webAPIUrl;
    Set Suite Variable    ${CompareServerUrl}    ${url}

    Close Browser

Create Context
    [Arguments]   ${url}    ${user}    ${pwd}
    ${parts}     Split String     ${url}    ://
    ${scheme}    Get From List    ${parts}    0
    ${host}      Get From List    ${parts}    1
    ${host}      Remove String    ${host}    /
    Create Http Context    ${host}    ${scheme}
    Set Basic Auth    ${user}    ${pwd}

    ${context}  Create Dictionary  url=${url}  user=${user}  pwd=${pwd}
    Set Test Variable  ${HTTP_CONTEXT}  ${context}

Restore Created Context
    Create Context  ${HTTP_CONTEXT.url}  ${HTTP_CONTEXT.user}  ${HTTP_CONTEXT.pwd}

Create Context: Web
    [Arguments]    ${user}=${AdminUsername}    ${pwd}=${Password}
    ${url}    Execute JavaScript    return window.webAPIUrl;
    Create Context    ${url}    ${user}    ${pwd}

Create Context: MC
    ${path}    Execute JavaScript    return window.location.pathname.indexOf('/admin') !== -1 ? '/${Branch}/admin'.toLowerCase() : '';
    Set Test Variable    ${PATH_MC}    ${path}

    ${scheme}    Execute JavaScript    return window.location.protocol.replace(':','');
    ${host}    Execute JavaScript    return window.location.host;
    Create Http Context    ${host}    ${scheme}
    ${cookie}    Get Cookie    EASECTOKEN
    Set Request Header    Cookie    EASECTOKEN=${cookie.value}

Create Context: Current Server
    [Arguments]    ${user}=${AdminUsername}    ${pwd}=${Password}
    Create Context    ${CurrentServerUrl}    ${user}    ${pwd}

Create Context: Base Server
    [Arguments]    ${user}=${AdminUsername}    ${pwd}=${Password}
    Create Context    ${CompareServerUrl}    ${user}    ${pwd}

Set Next Request Expectation
    [Arguments]    ${success}
    Run Keyword If    ${success}==True     Next Request Should Succeed
    ...    ELSE    Next Request Should Not Succeed

Send GET
    [Arguments]   ${path}    ${success}=True
    Set Next Request Expectation    ${success}
    Set Request Header    Content-Type    application/json
    GET     ${path}
    ${json}    Get Response Json
    [Return]    ${json}

Send PUT
    [Arguments]   ${path}    ${data}    ${success}=True
    Set Next Request Expectation    ${success}
    Set Request Header    Content-Type    application/json
    ${body}    Get Request Body    ${data}
    Set Request Body    ${body}
    PUT     ${path}
    ${json}    Get Response Json
    [Return]    ${json}

Send POST
    [Arguments]   ${path}    ${data}    ${success}=True
    Set Next Request Expectation    ${success}
    Set Request Header    Content-Type    application/json
    ${body}    Get Request Body    ${data}
    Set Request Body    ${body}
    POST     ${path}
    ${json}    Get Response Json
    [Return]    ${json}

Send DELETE
    [Arguments]   ${path}    ${success}=True
    Set Next Request Expectation    ${success}
    Set Request Header    Content-Type    application/json
    DELETE     ${path}

Get Json From File
    [Arguments]    ${filename}
    ${text}     Get File    ${EXECDIR}/WC/API/Mock/${filename}    
    ${json}     Parse Json    ${text}
    [Return]    ${json}

Get Text From File
    [Arguments]    ${filename}
    ${json}     Get Json From File    ${filename}
    ${text}   Stringify Json    ${json}
    [Return]    ${text}

Get Request Body
    [Arguments]    ${data}
    ${isFile}    Run Keyword And Return Status     Should End With    ${data}    .json
    ${body}    Run Keyword If    ${isFile}==True    Get Text From File    ${data}
    ...        ELSE    Set Variable    ${data}
    [Return]    ${body}

Get Response Json
    ${body}    Get Response Body
    ${json}    Parse Json    ${body}
    [Return]    ${json}

Get Uri From Response
    [Arguments]   ${body}
    ${uri}    Get From Dictionary    ${body}    uri
    [Return]    ${uri}

Start Clock: Current Server
    ${setVariable}    Run Keyword And Return Status    Variable Should Not Exist    \${TimerList1}
    Run Keyword If    ${setVariable}    Set Test Variable    	@{TimerList1}    @{EMPTY}

    ${dateStart}    Get Current Date
    Set Test Variable    ${TimerStart1}    ${dateStart}

Stop Clock: Current Server
    ${dateStop}    Get Current Date
    ${elapsed}    Subtract Date From Date	${dateStop}    ${TimerStart1}
    Append To List   ${TimerList1}    ${elapsed}

Start Clock: Base Server
    ${setVariable}    Run Keyword And Return Status    Variable Should Not Exist    \${TimerList2}
    Run Keyword If    ${setVariable}    Set Test Variable    	@{TimerList2}    @{EMPTY}

    ${dateStart}    Get Current Date
    Set Test Variable    ${TimerStart2}    ${dateStart}

Stop Clock: Base Server
    ${dateStop}    Get Current Date
    ${elapsed}    Subtract Date From Date	${dateStop}    ${TimerStart2}
    Append To List   ${TimerList2}    ${elapsed}

Performance Should Acceptable
    [Arguments]    ${percentAcceptable}

    # time on both servers
    ${time1}    Get Peek Time    ${TimerList1}
    ${time2}    Get Peek Time    ${TimerList2}

    # comparing result
    ${result}    Evaluate	(${time1} - ${time2}) / ${API_SLA} * 100

    Log    Current server: ${time1}s, base server: ${time2}s, comparing result: ${result}%

    Run Keyword IF    ${result} <= ${percentAcceptable}    No Operation
    ...    ELSE IF    ${time1} > ${API_SLA}         Fail    Performance is unacceptable, SLA ${API_SLA}s but it took ${time1}s
    ...    ELSE IF    ${result} > ${percentAcceptable}     Fail    Performance is droppped by ${result}%

Get Peek Time
    [Arguments]    ${timerList}

    # sort
    Sort List    ${timerList}
    Log    ${timerList}

    # time
    ${time}    Get From List    ${timerList}    0

    [Return]    ${time}

Clean Up Items
    [Arguments]    ${target}    ${items}    ${user}=${AdminUsername}    ${pwd}=${Password}
    : FOR    ${item}    IN   @{items}
    \    Run Keyword    Run Keyword    Create Context: ${target}  ${user}  ${pwd}
    \    Send DELETE    ${item}
