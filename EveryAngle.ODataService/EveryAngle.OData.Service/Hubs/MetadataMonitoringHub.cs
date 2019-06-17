using EveryAngle.OData.BackgroundWorkers;
using EveryAngle.OData.BusinessLogic.EdmBusinessLogics;
using EveryAngle.OData.BusinessLogic.Interfaces;
using EveryAngle.OData.Settings;
using EveryAngle.OData.Utils;
using EveryAngle.OData.ViewModel.Metadata;
using EveryAngle.Utilities.IoC;
using Microsoft.AspNet.SignalR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EveryAngle.OData.Service.Hubs
{
    public class MetadataMonitoringHub : Hub
    {
        // just instantiate it first, don't create everytime we call.
        private readonly ItemMonitoringViewModel _angleMonitoring = new ItemMonitoringViewModel();
        private readonly ItemMonitoringViewModel _displayMonitoring = new ItemMonitoringViewModel();
        private readonly ItemMonitoringViewModel _fieldMonitoring = new ItemMonitoringViewModel();
        private readonly MetadataMonitoringViewModel _metadataMonitoringViewModel = new MetadataMonitoringViewModel(ODataSettings.ViewModel, 0);

        private readonly IMasterEdmModelBusinessLogic _edmModelBusinessLogic = ObjectFactory.GetInstance<IMasterEdmModelBusinessLogic>();

        public void Start(string arg)  //NOSONAR
        {
            Task.Factory.StartNew(() =>
            {
                // first, checking for a connection between AS <> OService
                // comment out, we don't implement monitoring page right now.
                // CheckingMetadataProviderTask(); //NOSONAR

                // then, run a monitoring endless task
                StartSimpleMonitoringTask();
            });
        }

        private void MonitoringTask()
        {
            StartMonitoringTask();
        }

        private async void StartSimpleMonitoringTask() //NOSONAR
        {
            while (true)
            {
                // don't use Thread.Sleep for non blocking I/O.
                // add ConfigureAwait 'false' call to allow execution to continue in any thread. 
                await Task.Delay(TimeSpan.FromSeconds(2))
                          .ConfigureAwait(false);

                bool isRunning = SyncMetadataProcess.IsRunning;
                if (isRunning)
                {
                    Clients.Caller.ReportProgress(_metadataMonitoringViewModel.Init(ODataSettings.ViewModel, 0));
                }
                else
                {
                    Clients.Caller.ReportProgress(_metadataMonitoringViewModel.Init(
                        isRunning, 0, ODataSettings.ViewModel, _angleMonitoring, _displayMonitoring, _fieldMonitoring));
                }
            }
        }

        private async void StartMonitoringTask() //NOSONAR
        {
            while (true)
            {
                // don't use Thread.Sleep for non blocking I/O.
                // add ConfigureAwait 'false' call to allow execution to continue in any thread. 
                await Task.Delay(TimeSpan.FromSeconds(2))
                          .ConfigureAwait(false);

                int usingMemory = (int)_edmModelBusinessLogic.GetTotalMemory();
                bool isRunning = SyncMetadataProcess.IsRunning;
                if (isRunning)
                {
                    Clients.Caller.ReportProgress(_metadataMonitoringViewModel.Init(ODataSettings.ViewModel, usingMemory));
                }
                else
                {
                    // angles
                    _angleMonitoring.Init(
                        _edmModelBusinessLogic.CountAvailableAngles(),
                        _edmModelBusinessLogic.CountUnavailableAngles(),
                        _edmModelBusinessLogic.CountAngles());

                    // displays
                    _displayMonitoring.Init(
                        _edmModelBusinessLogic.CountAvailableDisplays(),
                        _edmModelBusinessLogic.CountUnavailableDisplays(),
                        _edmModelBusinessLogic.CountDisplays());

                    // fields
                    _fieldMonitoring.Init(
                        _edmModelBusinessLogic.CountAvailableFields(),
                        _edmModelBusinessLogic.CountUnavailableFields(),
                        _edmModelBusinessLogic.CountFields());

                    Clients.Caller.ReportProgress(_metadataMonitoringViewModel.Init(isRunning, usingMemory, ODataSettings.ViewModel, _angleMonitoring, _displayMonitoring, _fieldMonitoring));
                }
            }
        }

        private async void CheckingMetadataProviderTask() //NOSONAR
        {
            while (true)
            {
                // if application server is available, break the loop
                if (_edmModelBusinessLogic.IsAppServerAvailable(retryChecking: false))
                    break;

                // check every 10 secs
                // don't use Thread.Sleep for non blocking I/O.
                // add ConfigureAwait 'false' call to allow execution to continue in any thread. 
                await Task.Delay(TimeSpan.FromSeconds(10))
                          .ConfigureAwait(false);

                continue;
            }
        }
    }
}