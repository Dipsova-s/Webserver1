using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.ModelServer;
using EveryAngle.WebClient.Domain.Enums;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using System;

namespace EveryAngle.Core.ViewModels.Tests
{
    public class ModelServerViewModelTest : UnitTestBase
    {
        #region Tests

        [Test]
        public void ModelServerViewModel_TEST()
        {
            ModelServerViewModel viewModel = new ModelServerViewModel
            {
                id = "EA2_800_Server1",
                Uri = new Uri("/models/1/servers/2", UriKind.Relative),
                model = new Uri("/models/1", UriKind.Relative),
                info = new Uri("/models/1/servers/2/info", UriKind.Relative),
                type = "ModelServer",
                status = "Up",
                modelId = "EA2_800",
                task_details = new JObject(),
                instance_id = "_DF68CCBCCC6247D6958C71525E1AD516",
                license_id = "xxxx",
                instance_status = "Ready",
                application_version = "9999.9999.9243.2",
                timestamp = 1522312127,
                api_version = "0.16",
                size = "1073741824",
                error_count = "34",
                warning_count = "147",
                server_uri = "http://TH-WEBLB01.THEATST.ORG:31009",
                instance = new Uri("/models/1/instances/1", UriKind.Relative),
                event_log = new Uri("/models/1/servers/2/eventlog", UriKind.Relative),
                modeldata_timestamp = 1073019600,
                metadata_available = true,
                run_id = "1",
                run_result = "1",
                queryable = true,
                ModelServerId = "EA2_800_Server1",
                reports = new Uri("/models/1/servers/2/reports", UriKind.Relative),
                IsProcessing = false,
                available = true,
                IsActiveServer = true,
                IsCurrentInstance = true,
                currentInstanceTime = 1073019600,
                ErrorWarningNumber = 0,
                IsCaching = false
            };

            //assert type
            Assert.AreEqual(viewModel.id.GetType(), typeof(string));
            Assert.AreEqual(viewModel.Uri.GetType(), typeof(Uri));
            Assert.AreEqual(viewModel.model.GetType(), typeof(Uri));
            Assert.AreEqual(viewModel.info.GetType(), typeof(Uri));
            Assert.AreEqual(viewModel.type.GetType(), typeof(string));
            Assert.AreEqual(viewModel.Type.GetType(), typeof(ModelAgentType));
            Assert.AreEqual(viewModel.status.GetType(), typeof(string));
            Assert.AreEqual(viewModel.Status.GetType(), typeof(ModelServerStatus));
            Assert.AreEqual(viewModel.modelId.GetType(), typeof(string));
            Assert.AreEqual(viewModel.task_details.GetType(), typeof(JObject));
            Assert.AreEqual(viewModel.instance_id.GetType(), typeof(string));
            Assert.AreEqual(viewModel.license_id.GetType(), typeof(string));
            Assert.AreEqual(viewModel.instance_status.GetType(), typeof(string));
            Assert.AreEqual(viewModel.application_version.GetType(), typeof(string));
            Assert.AreEqual(viewModel.timestamp.GetType(), typeof(long));
            Assert.AreEqual(viewModel.api_version.GetType(), typeof(string));
            Assert.AreEqual(viewModel.size.GetType(), typeof(string));
            Assert.AreEqual(viewModel.FormattedSize.GetType(), typeof(string));
            Assert.AreEqual(viewModel.SupportModelSize.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.error_count.GetType(), typeof(string));
            Assert.AreEqual(viewModel.warning_count.GetType(), typeof(string));
            Assert.AreEqual(viewModel.server_uri.GetType(), typeof(string));
            Assert.AreEqual(viewModel.instance.GetType(), typeof(Uri));
            Assert.AreEqual(viewModel.event_log.GetType(), typeof(Uri));
            Assert.AreEqual(viewModel.modeldata_timestamp.GetType(), typeof(long));
            Assert.AreEqual(viewModel.SupportModelDate.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.metadata_available.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.queryable.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.run_id.GetType(), typeof(string));
            Assert.AreEqual(viewModel.run_result.GetType(), typeof(string));
            Assert.AreEqual(viewModel.ModelServerId.GetType(), typeof(string));
            Assert.AreEqual(viewModel.IsActiveServer.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.IsCurrentInstance.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.currentInstanceTime.GetType(), typeof(long));
            Assert.AreEqual(viewModel.ErrorWarningNumber.GetType(), typeof(int));
            Assert.AreEqual(viewModel.available.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.reports.GetType(), typeof(Uri));
            Assert.AreEqual(viewModel.IsProcessing.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.IsCaching.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.ModelServerName.GetType(), typeof(string));
            Assert.AreEqual(viewModel.IsModelServer.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.IsPrimaryType.GetType(), typeof(bool));
        }

        [Test]
        public void ModelServerViewModel_ModelServerType_TEST()
        {
            ModelServerViewModel viewModel = new ModelServerViewModel
            {
                id = "EA2_800_Server1",
                Uri = new Uri("/models/1/servers/2", UriKind.Relative),
                model = new Uri("/models/1", UriKind.Relative),
                info = new Uri("/models/1/servers/2/info", UriKind.Relative),
                type = "ModelServer",
                size = "1073741824",
                instance = new Uri("/models/1/instances/1", UriKind.Relative),
                event_log = new Uri("/models/1/servers/2/eventlog", UriKind.Relative),
                reports = new Uri("/models/1/servers/2/reports", UriKind.Relative)
            };

            Assert.AreEqual("1 GB", viewModel.FormattedSize);
            Assert.AreEqual(true, viewModel.SupportModelSize);
            Assert.AreEqual(true, viewModel.SupportModelDate);
            Assert.AreEqual(true, viewModel.IsModelServer);
            Assert.AreEqual(true, viewModel.IsPrimaryType);
            Assert.AreNotEqual(string.Empty, viewModel.ModelServerName);
        }

        [Test]
        public void ModelServerViewModel_HanaServerType_TEST()
        {
            ModelServerViewModel viewModel = new ModelServerViewModel
            {
                id = "EA4IT_EARTMS",
                Uri = new Uri("/models/1/servers/2", UriKind.Relative),
                model = new Uri("/models/1", UriKind.Relative),
                info = new Uri("/models/1/servers/2/info", UriKind.Relative),
                type = "HanaServer",
                instance = new Uri("/models/1/instances/1", UriKind.Relative),
                event_log = new Uri("/models/1/servers/2/eventlog", UriKind.Relative),
                reports = new Uri("/models/1/servers/2/reports", UriKind.Relative)
            };

            Assert.AreEqual(string.Empty, viewModel.FormattedSize);
            Assert.AreEqual(false, viewModel.SupportModelSize);
            Assert.AreEqual(false, viewModel.SupportModelDate);
            Assert.AreEqual(false, viewModel.IsModelServer);
            Assert.AreEqual(true, viewModel.IsPrimaryType);
            Assert.AreNotEqual(string.Empty, viewModel.ModelServerName);
        }

        [Test]
        public void ModelServerViewModel_ExtractorType_TEST()
        {
            ModelServerViewModel viewModel = new ModelServerViewModel
            {
                id = "EA2_800_Xtractor",
                Uri = new Uri("/models/1/servers/2", UriKind.Relative),
                model = new Uri("/models/1", UriKind.Relative),
                info = new Uri("/models/1/servers/2/info", UriKind.Relative),
                type = "Extractor",
                instance = new Uri("/models/1/instances/1", UriKind.Relative),
                event_log = new Uri("/models/1/servers/2/eventlog", UriKind.Relative),
                reports = new Uri("/models/1/servers/2/reports", UriKind.Relative)
            };

            Assert.AreEqual(string.Empty, viewModel.FormattedSize);
            Assert.AreEqual(false, viewModel.SupportModelSize);
            Assert.AreEqual(false, viewModel.SupportModelDate);
            Assert.AreEqual(false, viewModel.IsModelServer);
            Assert.AreEqual(false, viewModel.IsPrimaryType);
            Assert.AreNotEqual(string.Empty, viewModel.ModelServerName);
        }

        #endregion
    }
}
