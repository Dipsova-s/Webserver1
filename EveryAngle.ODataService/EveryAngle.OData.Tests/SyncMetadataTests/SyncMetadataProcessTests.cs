using EveryAngle.OData.BackgroundWorkers;
using EveryAngle.OData.Settings;
using NUnit.Framework;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EveryAngle.OData.Tests.SyncMetadataTests
{
    [TestFixture(Category = "SyncMetadata")]
    public class SyncMetadataProcessTests : UnitTestBase
    {
        #region private variables

        CancellationTokenSource _tokenSource;

        #endregion

        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            Initialize();

           _tokenSource = new CancellationTokenSource();
        }

        [TearDown]
        public void TearDown()
        {
            Reset();
        }

        #endregion

        #region tests

        [TestCase]
        public void Can_RunAsync_OK()
        {
            Assert.DoesNotThrow(() =>
            {
                SyncMetadataProcess.RunAsync(0, 1, _tokenSource, () => { });
                Thread.Sleep(100);
            });
        }

        [TestCase]
        public void Can_RunAsync_Cancelled()
        {
            _tokenSource.Cancel();
            Assert.DoesNotThrow(() =>
            {
                SyncMetadataProcess.RunAsync(0, 1, _tokenSource, () => { });
                Thread.Sleep(100);
            });
        }

        [TestCase(true, true)]
        [TestCase(false, false)]
        public void Can_ResetTimer(bool hasTimer, bool expected)
        {
            if (hasTimer)
                SyncMetadataProcess.RunAsync(60000, 1, _tokenSource, () => { });
            bool result = SyncMetadataProcess.ResetTimer();

            Assert.AreEqual(result, expected);
        }

        [TestCase(1, true)]
        [TestCase(int.MinValue, false)]
        public void Can_TransactTimerInterval(int interval, bool expected)
        {

            ODataSettings.Settings.MetadataResyncMinutes = interval;
            SyncMetadataProcess.RunAsync(60000, 1, _tokenSource, () => { });
            bool result = SyncMetadataProcess.TransactTimerInterval();

            Assert.AreEqual(SyncMetadataProcess.IsRunning, false);
            Assert.AreEqual(result, expected);
        }

        [TestCase]
        public void Can_TransactSyncMetadataToSlaveModel_OK()
        {
            SyncMetadataProcess.RunAsync(60000, 1, _tokenSource, () => { });
            bool result = SyncMetadataProcess.TransactSyncMetadataToSlaveModel();

            Assert.IsTrue(result);
        }

        [TestCase]
        public void Can_TransactSyncMetadataToSlaveModel_Cancelled()
        {
            SyncMetadataProcess.RunAsync(60000, 1, _tokenSource, () => { });
            _tokenSource.Cancel();

            bool result = SyncMetadataProcess.TransactSyncMetadataToSlaveModel();

            Assert.IsFalse(result);
        }

        [TestCase]
        public void Can_TransactSyncMetadataToSlaveModel_Failure()
        {
            SyncMetadataProcess.RunAsync(60000, 1, _tokenSource, null);
            SyncMetadataProcess.SyncMetadataTask = Task.FromException(new Exception());

            bool result = SyncMetadataProcess.TransactSyncMetadataToSlaveModel();

            Assert.IsFalse(result);
        }

        [TestCase]
        public void Can_SyncMetadataToSlaveModel_Cancelled()
        {
            SyncMetadataProcess.RunAsync(60000, 1, _tokenSource, () => { });
            _tokenSource.Cancel();

            Assert.Throws<OperationCanceledException>(SyncMetadataProcess.SyncMetadataToSlaveModel);
        }

        #endregion

        #region private method

        private void Reset()
        {
            try
            {
                if (_tokenSource.Token.CanBeCanceled)
                    _tokenSource.Cancel();
                if (SyncMetadataProcess._timer != null)
                    SyncMetadataProcess._timer.Dispose();
                SyncMetadataProcess._timer = null;
            }
            finally
            {
                // no error
            }
        }

        #endregion
    }
}
