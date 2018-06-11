*** Variables ***
${btnSaveWelcomePage}             css=.btnSave

${txtHostname}                                  sap_host
${txtSystemNumber}                              sap_systemnumber
${txtSystemID}                                  sap_systemid
${txtClient}                                    sap_client
${txtUsername}                                  sap_username
${txtPassword}                                  sap_password
${txtLanguage}                                  sap_language
${txtNumberOfConcurrentTableeExtractions}       sap_numprocextraction
${txtNumberOfConcurrentDownload}                sap_numproccopy
${txtNumberOfConcurrentIndexingProcesses}       sap_numprocindexmerge
${chkUserFixedSAPServer}                        sap_fixedbatchserver
${ddlJobClass}                                  sap_jobclass
${chkCountSEA03Users}                           sap_countzea03users
${chkRemoveABAP}                                sap_removeabap
${chkCloseSMBConnections}                       sap_closesmbconnections
${txtRFCModuleName}                             sap_rfcmodulename
${txtFTPPushModuleName}                         sap_ftppushmodulename
${chkUserLoadBalancing}                         sap_useloadbalancing
${txtGroupName}                                 sap_groupname
${txtPrefix}                                    sap_prefix
${txtCopyMethod}                                copy_method
${txtSAPLogicalFilePath}                        copy_smb_saplogicalfilepath
${txtCopyMethodUsername}                                  copy_smb_username
${txtCopyMethodPassword}                                  copy_smb_password
${txtPath}                                      copy_smb_path
${chkZIPTableData}                              copy_smb_transmissioncompression

${ddlFTPTool}                                      ftp_tool
${txtFTPCommand}                                ftp_command
${txtReadTimeoutInSeconds}                      ftp_readtimeoutinsecs
${txtUseCygwinFilenames}                        sftp_cygwinfilenames
${txtSFTPCommand}                               sftp_command
${txtMaxMinutesIdle}                            sftp_maxidleminutes

${chkUseDispatcherWithLogin}                           log_use_dispatcher
${txtMinutesBetweenLoggingStatistics}                  log_minutesbetweenlogging
${txtMinimalFileSizeForSortLogging}                    log_filesorterminimalsize
${txtCommandsNotToAddToTheFinishedCommandsLog}         finishedcommands_neveradd
${txtDiscardFinishedCommandsAfter}                     finishedcommands_discard
${txtPerformanceLogIntervalInSeconds}                  perflog_interval
${chkPerformanceLogShowDetailedProcessInfo}            perflog_detailprocesinfo
${txtPerformanceLogFileName}                           perflog_logfile
${chkPerformanceLogIncludeProcessorUsage}              perflog_includeprocessor
${chkPerformanceLogIncludeMemoryUsage}                 perflog_includememory
${chkPerformanceLogIncludeDiskIOActivities}            perflog_includediskio
${chkPerformanceLogIncludeSystemInformation}           perflog_includesysteminfo
${chkPerformanceLogInludeFeeDiskspaceInformation}      perflog_includefreediskspace
${chkPerformanceLogInludeMemoryUsageOfEA}              perflog_includememoryea

${txtLongTextLengthUsedByFunctionModule}                 longtextlength
${txtTimeoutForCommunicationByRFC}                       rfctimeout
${txtExternalCommandsCommandForFilehandles}              filehandles_command
${txtExternalCommandsCommandForTheDeltamerger}           deltamerger_command
${txtExternalCommandsCommandForTheTableindexer}          tableindexer_command
${txtListOfTablesWhichWillNotBeIndexedAfterDownload}     tabletoskipforindexing
${txtExternalCommandsCommandForTheDownloadDeterminer}    downloaddeterminer_command
${txtExternalCommandsCommandForTheSchemabuilder}         schemabuilder_command
${txtCommandForFTPPushSupport}                           ftppush_command
${chkDoFTPPushInBatches}                                 ftppushinbatch
${txtNumberOfDaysToKeepExtractionReports}                keep_history_in_days
${txtXtractorWatchdogShutdownTimeout}                    xtractor_shutdownwatchdog_timeout

${txtURIOfTheDualDownloadAgent1}                         dual_service_uri_1
${txtUNCPathBasemodelFolderPathOfDualDownloadAgent1}     dual_service_data_1
${txtURIOfTheDualDownloadAgent2}                         dual_service_uri_2
${txtUNCPathBaseModelFolderPathOfDualDownloadAgent2}     dual_service_data_2
${txtURIOfTheDualDownloadAgent3}                         dual_service_uri_3
${txtUNCPathBaseModelFolderPathOfDualDownloadAgent3}     dual_service_data_3

*** Keywords ***
#SAP connection settings
Input EAXtractor Hostname
    [Arguments]    ${hostname}
    Input Text    ${txtHostname}    ${hostname}

Input EAXtractor System Number
    [Arguments]    ${systemNumber}
    Input Text    ${txtSystemNumber}    ${systemNumber}

Input EAXtractor System ID
    [Arguments]    ${systemID}
    Input Text    ${txtSystemID}    ${systemID}

Input EAXtractor Client
    [Arguments]    ${client}
    Input Text    ${txtClient}    ${client}

Input EAXtractor Username
    [Arguments]    ${username}
    Input Text    ${txtUsername}    ${username}

Input EAXtractor Password
    [Arguments]    ${password}
    Input Text    ${txtPassword}    ${password}

Input EAXtractor Language
    [Arguments]    ${language}
    Input Text    ${txtLanguage}    ${language}

Input EAXtractor Number Of concurrent Table Extractions
    [Arguments]    ${numberOfConcurrentTableeExtractions}
    Input kendo Numeric TextBox    ${txtNumberOfConcurrentTableeExtractions}    ${numberOfConcurrentTableeExtractions}

Input EAXtractor Number Of Concurrent Downloads
    [Arguments]    ${numberOfConcurrentDownload}
    Input kendo Numeric TextBox    ${txtNumberOfConcurrentDownload}    ${numberOfConcurrentDownload}

Input EAXtractor Number Of Concurrent Indexing Processes
    [Arguments]    ${numberOfConcurrentIndexingProcesses}
    Input kendo Numeric TextBox    ${txtNumberOfConcurrentIndexingProcesses}    ${numberOfConcurrentIndexingProcesses}

Click EAXtractor Use Fixed SAP Server
    Wait Until Page Contains Element    ${chkUserFixedSAPServer}
    Click Element    ${chkUserFixedSAPServer}

Set Job class To EAXtractor
    [Arguments]    ${jobClass}
    Wait Until Page Contains Element    ${ddlJobClass}
    Select Dropdown By InnerText     ${ddlJobClass}    ${jobClass}

Click EAXtractor Count ZEA03 users
    Wait Until Page Contains Element    ${chkCountSEA03Users}
    Click Element    ${chkCountSEA03Users}

Click EAXtractor Remove ABAP
    Wait Until Page Contains Element    ${chkRemoveABAP}
    Click Element    ${chkRemoveABAP}

Click EAXtractor Close SMB connections
    Wait Until Page Contains Element    ${chkCloseSMBConnections}
    Click Element    ${chkCloseSMBConnections}

Input EAXtractor RFC Module Name
    [Arguments]    ${RFCModuleName}
    Input Text    ${txtRFCModuleName}    ${RFCModuleName}

Input EAXtractor FTPPush Module Name
    [Arguments]    ${FTPPushModuleName}
    Input Text    ${txtFTPPushModuleName}    ${FTPPushModuleName}

Click EAXtractor Use Load Balancing
    Wait Until Page Contains Element    ${chkUserLoadBalancing}
    Click Element    ${chkUserLoadBalancing}

Input EAXtractor Group Name
    [Arguments]    ${groupName}
    Input Text    ${txtGroupName}    ${groupName}

Input EAXtractor Prefix
    [Arguments]    ${prefix}
    Input Text    ${txtPrefix}    ${prefix}

Set Copy Method To EAXtractor
    [Arguments]    ${jobClass}
    Wait Until Page Contains Element    ${copyMethod}
    Select Dropdown By InnerText     ${txtCopyMethod}    ${copyMethod}

Input EAXtractor SAP Logical File Path
    [Arguments]    ${SAPLogicalFilePath}
    Input Text    ${txtSAPLogicalFilePath}    ${SAPLogicalFilePath}

Input EAXtractor Copy Mehtod Username
    [Arguments]    ${copyMethodUsername}
    Input Text    ${txtCopyMethodUsername}    ${copyMethodUsername}

Input EAXtractor Copy Mehtod Password
    [Arguments]    ${copyMethodPassword}
    Input Text    ${txtCopyMethodPassword}    ${copyMethodPassword}

Input EAXtractor Copy Mehtod Path
    [Arguments]    ${path}
    Input Text    ${txtPath}    ${path}

Click EAXtractor ZIP Table Data
    Wait Until Page Contains Element    ${chkZIPTableData}
    Click Element    ${chkZIPTableData}

#General (S)FTP settings
Set FTP Tool To EAXtractor
    [Arguments]    ${FTPTool}
    Wait Until Page Contains Element    ${ddlFTPTool}
    Select Dropdown By InnerText     ${ddlFTPTool}    ${FTPTool}

Input EAXtractor FTP Command
    [Arguments]    ${FTPCommand}
    Input Text    ${txtFTPCommand}    ${FTPCommand}

Input EAXtractor Read Timeout In Seconds
    [Arguments]    ${readTimeoutInSeconds}
    Input kendo Numeric TextBox    ${txtReadTimeoutInSeconds}    ${readTimeoutInSeconds}

Input EAXtractor Use Cygwin Filenames
    [Arguments]    ${useCygwinFilenames}
    Input Text    ${txtUseCygwinFilenames}    ${useCygwinFilenames}

Input EAXtractor SFTP Command
    [Arguments]    ${SFTPCommand}
    Input Text    ${txtSFTPCommand}    ${SFTPCommand}

Input EAXtractor Max Minutes Idle
    [Arguments]    ${maxMinutesIdle}
    Input kendo Numeric TextBox    ${txtMaxMinutesIdle}    ${maxMinutesIdle}

#General settings for Xtractor logging
Click EAXtractor Use Dispatcher With Logging
    Wait Until Page Contains Element    ${chkUseDispatcherWithLogin}
    Click Element    ${chkUseDispatcherWithLogin}

Input EAXtractor Minutes Between Logging Statistics
    [Arguments]    ${minutesBetweenLoggingStatistics}
    Input kendo Numeric TextBox    ${txtMinutesBetweenLoggingStatistics}    ${minutesBetweenLoggingStatistics}

Input EAXtractor Minimal File Size For Sort Logging
    [Arguments]    ${minimalFileSizeForSortLogging}
    Input kendo Numeric TextBox    ${txtMinimalFileSizeForSortLogging}    ${minimalFileSizeForSortLogging}

Input EAXtractor Commands Not To Add To The Finished Commands Log
    [Arguments]    ${commandsNotToAddToTheFinishedCommandsLog}
    Input Text    ${txtCommandsNotToAddToTheFinishedCommandsLog}    ${commandsNotToAddToTheFinishedCommandsLog}

Input EAXtractor Discard Finished Commands After
    [Arguments]    ${discardFinishedCommandsAfter}
    Input kendo Numeric TextBox    ${txtDiscardFinishedCommandsAfter}    ${discardFinishedCommandsAfter}

Input EAXtractor Performace Log Interval In Seconds
    [Arguments]    ${performanceLogIntervalInSeconds}
    Input kendo Numeric TextBox    ${txtPerformanceLogIntervalInSeconds}    ${performanceLogIntervalInSeconds}

Click EAXtractor Performance Log Show Detailed Process Info
    Wait Until Page Contains Element    ${chkPerformanceLogShowDetailedProcessInfo}
    Click Element    ${chkPerformanceLogShowDetailedProcessInfo}

Input EAXtractor Performance log filename
    [Arguments]    ${performanceLogFileName}
    Input Text    ${txtPerformanceLogFileName}    ${performanceLogFileName}

Click EAXtractor Performance Log Include Processor Usage
    Wait Until Page Contains Element    ${chkPerformanceLogIncludeProcessorUsage}
    Click Element    ${chkPerformanceLogIncludeProcessorUsage}

Click EAXtractor Performance Log Include Memory Usage
    Wait Until Page Contains Element    ${chkPerformanceLogIncludeMemoryUsage}
    Click Element    ${chkPerformanceLogIncludeMemoryUsage}

Click EAXtractor Performance Log Include Disk IO Activities
    Wait Until Page Contains Element    ${chkPerformanceLogIncludeDiskIOActivities}
    Click Element    ${chkPerformanceLogIncludeDiskIOActivities}

Click EAXtractor Performance Log Include System Information
    Wait Until Page Contains Element    ${chkPerformanceLogIncludeSystemInformation}
    Click Element    ${chkPerformanceLogIncludeSystemInformation}

Click EAXtractor Performance Log Include Free Diskspace Information
    Wait Until Page Contains Element    ${chkPerformanceLogInludeFeeDiskspaceInformation}
    Click Element    ${chkPerformanceLogInludeFeeDiskspaceInformation}

Click EAXtractor Performance Log Include Memory Usage Of EA
    Wait Until Page Contains Element    ${chkPerformanceLogInludeMemoryUsageOfEA}
    Click Element    ${chkPerformanceLogInludeMemoryUsageOfEA}

#General settings for Xtractor and tools
Input EAXtractor Long Text Length Used By Function Module
    [Arguments]    ${longTextLengthUsedByFunctionModule}
    Input kendo Numeric TextBox    ${txtLongTextLengthUsedByFunctionModule}    ${longTextLengthUsedByFunctionModule}

Input EAXtractor Timeout For Communication By RFC
    [Arguments]    ${timeoutForCommunicationByRFC}
    Input kendo Numeric TextBox    ${txtTimeoutForCommunicationByRFC}    ${timeoutForCommunicationByRFC}

Input EAXtractor External Commands Command For Filehandles
    [Arguments]    ${externalCommandsCommandForFilehandles}
    Input Text    ${txtExternalCommandsCommandForFilehandles}    ${externalCommandsCommandForFilehandles}

Input EAXtractor External Commands Command For The Deltamerger
    [Arguments]    ${externalCommandsCommandForTheDeltamerger}
    Input Text    ${txtExternalCommandsCommandForTheDeltamerger}    ${externalCommandsCommandForTheDeltamerger}

Input EAXtractor External commands Command For The Tableindexer
    [Arguments]    ${externalCommandsCommandForTheTableindexer}
    Input Text    ${txtExternalCommandsCommandForTheTableindexer}    ${externalCommandsCommandForTheTableindexer}

Input EAXtractor List Of Tables Which Will Not Be Indexed After Download
    [Arguments]    ${listOfTablesWhichWillNotBeIndexedAfterDownload}
    Input Text    ${txtListOfTablesWhichWillNotBeIndexedAfterDownload}    ${listOfTablesWhichWillNotBeIndexedAfterDownload}

Input EAXtractor External Commands Command For The Download Determiner
    [Arguments]    ${externalCommandsCommandForTheDownloadDeterminer}
    Input Text    ${txtExternalCommandsCommandForTheDownloadDeterminer}    ${externalCommandsCommandForTheDownloadDeterminer}

Input EAXtractor External Commands Command For The Schemabuilder
    [Arguments]    ${externalCommandsCommandForTheSchemabuilder}
    Input Text    ${txtExternalCommandsCommandForTheSchemabuilder}    ${externalCommandsCommandForTheSchemabuilder}

Input EAXtractor Command For FTP Push Support
    [Arguments]    ${commandForFTPPushSupport}
    Input Text    ${txtCommandForFTPPushSupport}    ${commandForFTPPushSupport}

Click EAXtractor Do FTP Push In Batches
    Wait Until Page Contains Element    ${chkDoFTPPushInBatches}
    Click Element    ${chkDoFTPPushInBatches}

Input EAXtractor Number Of Days To Keep Extraction Reports
    [Arguments]    ${numberOfDaysToKeepExtractionReports}
    Input kendo Numeric TextBox    ${txtNumberOfDaysToKeepExtractionReports}    ${numberOfDaysToKeepExtractionReports}

Input EAXtractor Watchdog Shutdown Timeout
    [Arguments]    ${xtractorWatchdogShutdownTimeout}
    Input kendo Numeric TextBox    ${txtXtractorWatchdogShutdownTimeout}    ${xtractorWatchdogShutdownTimeout}

#Settings for dual download
Input EAXtractor URI Of The Dual Download Agent #1
    [Arguments]    ${URIOfTheDualDownloadAgent1}
    Input Text    ${txtURIOfTheDualDownloadAgent1}    ${URIOfTheDualDownloadAgent1}

Input EAXtractor UNC Path Base Model Folder Path Of Dual Download Agent #1
    [Arguments]    ${UNCPathBasemodelFolderPathOfDualDownloadAgent1}
    Input Text    ${txtUNCPathBasemodelFolderPathOfDualDownloadAgent1}    ${UNCPathBasemodelFolderPathOfDualDownloadAgent1}

Input EAXtractor URI Of The Dual Download Agent #2
    [Arguments]    ${URIOfTheDualDownloadAgent2}
    Input Text    ${txtURIOfTheDualDownloadAgent2}    ${URIOfTheDualDownloadAgent2}

Input EAXtractor UNC Path Base Model Folder Path Of Dual Download Agent #2
    [Arguments]    ${UNCPathBaseModelFolderPathOfDualDownloadAgent2}
    Input Text    ${txtUNCPathBaseModelFolderPathOfDualDownloadAgent2}    ${UNCPathBaseModelFolderPathOfDualDownloadAgent2}

Input EAXtractor URI Of The Dual Download Agent #3
    [Arguments]    ${URIOfTheDualDownloadAgent3}
    Input Text    ${txtURIOfTheDualDownloadAgent3}    ${URIOfTheDualDownloadAgent3}

Input EAXtractor UNC Path Base Model Folder Path Of Dual Download Agent #3
    [Arguments]    ${UNCPathBaseModelFolderPathOfDualDownloadAgent3}
    Input Text    ${txtUNCPathBaseModelFolderPathOfDualDownloadAgent3}    ${UNCPathBaseModelFolderPathOfDualDownloadAgent3}


