using EveryAngle.OData.Settings;
using EveryAngle.OData.Utils.Logs;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EveryAngle.OData.BackgroundWorkers
{
    public static class SyncMetadataProcess
    {
        #region private variables

        private static bool _isRunning;
        private static int _intervalInMinutes;
        private static int _intervalInMilliseconds { get { return _intervalInMinutes * 60000; } }
        private static bool _isIntervalTimeChanged { get { return ODataSettings.Settings.MetadataResyncMinutes != _intervalInMinutes; } }

        private static Task _syncMetadataTask;
        private static Timer _timer;
        private static CancellationToken _token;
        private static CancellationTokenSource _tokenSource;
        private static Action _syncMetadataAction;
        private static DateTime _syncDateTime;

        #endregion

        #region public variables

        public static Task SyncMetadataTask { get { return _syncMetadataTask; } }
        public static bool IsRunning { get { return _isRunning; } }
        public static DateTime SyncDateTime { get { return _syncDateTime; } }
        public static bool IsIntervalTimeChanged { get { return _isIntervalTimeChanged; } }

        #endregion

        #region public functions

        public static void RunAsync(int dueTime, int intervalInMinutes, CancellationTokenSource tokenSource, Action syncMetadataAction)
        {
            _tokenSource = tokenSource;
            _token = tokenSource.Token;
            _intervalInMinutes = intervalInMinutes;
            _timer = new Timer(OnTimer, null, dueTime, _intervalInMilliseconds);
            _syncMetadataAction = syncMetadataAction;

            LogService.Info("Sync metadata monitoring timer started");
        }

        #endregion

        #region private functions

        private static void OnTimer(object sender)
        {
            _timer.Change(Timeout.Infinite, Timeout.Infinite);
            try
            {
                _isRunning = true;
                _syncMetadataTask = Task.Factory.StartNew(() => TransactSyncMetadataToSlaveModel(), _token,
                                    TaskCreationOptions.DenyChildAttach | TaskCreationOptions.LongRunning, TaskScheduler.Default);

                _syncMetadataTask.Wait();
            }
            finally
            {
                if (!_token.IsCancellationRequested)
                    ResetTimer();
                else
                    LogService.Info("Sync metadata monitoring timer stopped");
            }
        }

        private static void ResetTimer()
        {
            try
            {
                TransactTimerInterval();
                _timer.Change(_intervalInMilliseconds, _intervalInMilliseconds);
            }
            catch (Exception ex)
            {
                LogService.Error("Sync metadata check: Error resetting timer interval.", ex);
            }
        }

        private static void TransactTimerInterval()
        {
            try
            {
                if (_isIntervalTimeChanged)
                {
                    LogService.Info(
                        string.Format(
                            "Sync metadata check: Detected changed interval for re-sync metadata check, changed from {0} to {1} minutes.",
                            _intervalInMinutes, ODataSettings.Settings.MetadataResyncMinutes));
                    _intervalInMinutes = ODataSettings.Settings.MetadataResyncMinutes;
                }

                _isRunning = false;
                _syncDateTime = DateTime.Now.AddMinutes(_intervalInMinutes);
            }
            catch (Exception ex)
            {
                LogService.Error("Sync metadata check: Error checking timer interval.", ex);
            }
        }

        private static void TransactSyncMetadataToSlaveModel()
        {
            try
            {
                SyncMetadataToSlaveModel();
            }
            catch (OperationCanceledException)
            {
                LogService.Info("Sync metadata check: Cancel received while sync a metadata");
            }
            catch (Exception e)
            {
                LogService.Error("Sync metadata check: Error checking while sync a metadata", e);
                LogService.Error("Sync metadata check: Task Exception result, ", _syncMetadataTask.Exception);
            }
        }

        private static void SyncMetadataToSlaveModel()
        {
            // start sync metadata here
            _syncMetadataAction.Invoke();
            // end sync metadata here

            if (_token.IsCancellationRequested)
                _token.ThrowIfCancellationRequested();

            LogService.Info("SyncMetadataToSlaveModel: finished");
        }

        #endregion
    }
}
