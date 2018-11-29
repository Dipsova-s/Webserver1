using EveryAngle.WebClient.Domain.Enums;
using Newtonsoft.Json;
using NUnit.Framework;

namespace EveryAngle.Core.ViewModels.Tests.Component
{
    public class ComponentViewModelTest
    {
        #region IsDeletable
        [TestCase(ComponentServiceManagerType.ApplicationServer)]
        [TestCase(ComponentServiceManagerType.WebServer)]
        public void ComponentViewModel_Should_UnDeletable(ComponentServiceManagerType type)
        {
            string jsonString = $"{{type:'{type}'}}";
            ComponentViewModel viewModel = JsonConvert.DeserializeObject<ComponentViewModel>(jsonString);
            Assert.AreEqual(false, viewModel.IsDeletable);
        }

        [TestCase(ComponentServiceManagerType.ClassicModelQueryService)]
        [TestCase(ComponentServiceManagerType.DataDiscoveryService)]
        [TestCase(ComponentServiceManagerType.ExtractionService)]
        [TestCase(ComponentServiceManagerType.ModelAgentService)]
        [TestCase(ComponentServiceManagerType.ModelRepositoryService)]
        [TestCase(ComponentServiceManagerType.RealtimeModelQueryService)]
        [TestCase(ComponentServiceManagerType.Unknown)]
        public void ComponentViewModel_Should_Deletable(ComponentServiceManagerType type)
        {
            string jsonString = $"{{type:'{type}'}}";
            ComponentViewModel viewModel = JsonConvert.DeserializeObject<ComponentViewModel>(jsonString);
            Assert.AreEqual(true, viewModel.IsDeletable);
        }
        #endregion

        #region IsDownloadMetadataEnabled 
        [TestCase(ComponentServiceManagerType.ClassicModelQueryService)]
        [TestCase(ComponentServiceManagerType.DataDiscoveryService)]
        public void ComponentViewModel_Should_AbleToDownloadMetadata(ComponentServiceManagerType type)
        {
            string jsonString = $"{{type:'{type}'}}";
            ComponentViewModel viewModel = JsonConvert.DeserializeObject<ComponentViewModel>(jsonString);
            Assert.AreEqual(true, viewModel.IsDownloadMetadataEnabled);
        }

        [TestCase(ComponentServiceManagerType.ApplicationServer)]
        [TestCase(ComponentServiceManagerType.WebServer)]
        [TestCase(ComponentServiceManagerType.ExtractionService)]
        [TestCase(ComponentServiceManagerType.ModelAgentService)]
        [TestCase(ComponentServiceManagerType.ModelRepositoryService)]
        [TestCase(ComponentServiceManagerType.RealtimeModelQueryService)]
        [TestCase(ComponentServiceManagerType.Unknown)]
        public void ComponentViewModel_Should_NotAbleToDownloadMetadata(ComponentServiceManagerType type)
        {
            string jsonString = $"{{type:'{type}'}}";
            ComponentViewModel viewModel = JsonConvert.DeserializeObject<ComponentViewModel>(jsonString);
            Assert.AreEqual(false, viewModel.IsDownloadMetadataEnabled);
        }
        #endregion

        #region IsInfoEnabled
        [TestCase(ComponentServiceManagerType.ClassicModelQueryService)]
        [TestCase(ComponentServiceManagerType.DataDiscoveryService)]
        [TestCase(ComponentServiceManagerType.ExtractionService)]
        public void ComponentViewModel_Should_AbleToShowInfo(ComponentServiceManagerType type)
        {
            string jsonString = $"{{type:'{type}'}}";
            ComponentViewModel viewModel = JsonConvert.DeserializeObject<ComponentViewModel>(jsonString);
            Assert.AreEqual(true, viewModel.IsInfoEnabled);
        }

        [TestCase(ComponentServiceManagerType.ApplicationServer)]
        [TestCase(ComponentServiceManagerType.WebServer)]
        [TestCase(ComponentServiceManagerType.ModelAgentService)]
        [TestCase(ComponentServiceManagerType.ModelRepositoryService)]
        [TestCase(ComponentServiceManagerType.RealtimeModelQueryService)]
        [TestCase(ComponentServiceManagerType.Unknown)]
        public void ComponentViewModel_Should_NotAbleToShowInfo(ComponentServiceManagerType type)
        {
            string jsonString = $"{{type:'{type}'}}";
            ComponentViewModel viewModel = JsonConvert.DeserializeObject<ComponentViewModel>(jsonString);
            Assert.AreEqual(false, viewModel.IsInfoEnabled);
        }

        #endregion
    }
}