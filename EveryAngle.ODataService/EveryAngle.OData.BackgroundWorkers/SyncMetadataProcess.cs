using EveryAngle.OData.Settings;
using EveryAngle.OData.Utils.Logs;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EveryAngle.OData.BackgroundWorkers
{
    public static class SyncMetadataProcess
    {

        #region internal variables
        internal static int _intervalInMinutes;
        internal static int _intervalInMilliseconds { get { return _intervalInMinutes * 60000; } }

        internal static Timer _timer;
        internal static CancellationToken _token;
        internal static Action _syncMetadataAction;

        #endregion

        #region public variables

        public static Task SyncMetadataTask { get; internal set; }
        public static bool IsRunning { get; internal set; }
        public static DateTime SyncDateTime { get; private set; }
        public static bool IsIntervalTimeChanged { get { return ODataSettings.Settings.MetadataResyncMinutes != _intervalInMinutes; } }

        #endregion

        #region public functions

        public static void RunAsync(int dueTime, int intervalInMinutes, CancellationTokenSource tokenSource, Action syncMetadataAction)
        {
            _token = tokenSource.Token;
            _intervalInMinutes = intervalInMinutes;
            _timer = new Timer(OnTimer, null, dueTime, _intervalInMilliseconds);
            _syncMetadataAction = syncMetadataAction;

            LogService.Info("Sync metadata monitoring timer started");
        }

        #endregion

        #region internal functions

        internal static void OnTimer(object sender)
        {
            _timer.Change(Timeout.Infinite, Timeout.Infinite);
            try
            {
                IsRunning = true;
                SyncMetadataTask = Task.Factory.StartNew(() => TransactSyncMetadataToSlaveModel(), _token,
                                    TaskCreationOptions.DenyChildAttach | TaskCreationOptions.LongRunning, TaskScheduler.Default);

                SyncMetadataTask.Wait();
            }
            finally
            {
                if (!_token.IsCancellationRequested)
                    ResetTimer();
                else
                    LogService.Info("Sync metadata monitoring timer stopped");
            }
        }

        internal static bool ResetTimer()
        {
            try
            {
                TransactTimerInterval();
                _timer.Change(_intervalInMilliseconds, _intervalInMilliseconds);
                return true;
            }
            catch (Exception ex)
            {
                LogService.Error("Sync metadata check: Error resetting timer interval.", ex);
                return false;
            }
        }

        internal static bool TransactTimerInterval()
        {
            try
            {
                if (IsIntervalTimeChanged)
                {
                    LogService.Info(
                        string.Format(
                            "Sync metadata check: Detected changed interval for re-sync metadata check, changed from {0} to {1} minutes.",
                            _intervalInMinutes, ODataSettings.Settings.MetadataResyncMinutes));
                    _intervalInMinutes = ODataSettings.Settings.MetadataResyncMinutes;
                }

                IsRunning = false;
                SyncDateTime = DateTime.Now.AddMinutes(_intervalInMinutes);
                return true;
            }
            catch (Exception ex)
            {
                LogService.Error("Sync metadata check: Error checking timer interval.", ex);
                return false;
            }
        }

        internal static bool TransactSyncMetadataToSlaveModel()
        {
            try
            {
                SyncMetadataToSlaveModel();
                return true;
            }
            catch (OperationCanceledException)
            {
                LogService.Info("Sync metadata check: Cancel received while sync a metadata");
                return false;
            }
            catch (Exception e)
            {
                LogService.Error("Sync metadata check: Error checking while sync a metadata", e);
                LogService.Error("Sync metadata check: Task Exception result, ", SyncMetadataTask.Exception);
                return false;
            }
        }

        internal static void SyncMetadataToSlaveModel()
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
