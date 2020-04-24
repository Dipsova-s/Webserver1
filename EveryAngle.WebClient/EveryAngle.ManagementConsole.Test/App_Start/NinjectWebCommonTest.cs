using EveryAngle.Core.Interfaces.Services;
using EveryAngle.ManagementConsole.App_Start;
using EveryAngle.WebClient.Service.ApiServices;
using EveryAngle.WebClient.Service.ApplicationServices;
using EveryAngle.WebClient.Service.WebClientConfigs;
using Moq;
using Ninject;
using Ninject.Syntax;
using NUnit.Framework;
using System;

namespace EveryAngle.ManagementConsole.Test.App_Start
{
    [TestFixture]
    public class NinjectWebCommonTest
    {
        [Test]
        public void RegisterServices_Should_RegisterRepositoryLogService()
        {
            Mock<IKernel> kernel = new Mock<IKernel>();

            AddBind<IModelService, ModelService>(kernel);
            AddBind<IDirectoryService, DirectoryService>(kernel);
            AddBind<IUserService, UserService>(kernel);
            AddBind<IModelAgentService, ModelAgentService>(kernel);
            AddBind<ICommentService, CommentService>(kernel);
            AddBind<IGlobalSettingService, GlobalSettingService>(kernel);
            AddBind<ILabelService, LabelService>(kernel);
            AddBind<ISystemInformationService, SystemInformationService>(kernel);
            AddBind<ISessionService, SessionService>(kernel);
            AddBind<IDownloadTableService, DownloadTableService>(kernel);
            AddBind<IWebClientConfigService, WebClientConfigService>(kernel);
            AddBind<IAutomationTaskService, AutomationTaskService>(kernel);
            AddBind<ITaskService, TaskService>(kernel);
            AddBind<IPackageService, PackageService>(kernel);
            AddBind<IFacetService, FacetService>(kernel);
            AddBind<IRepositoryLogService, RepositoryLogService>(kernel);
            AddBind<IItemService, ItemService>(kernel);
            AddBind<ISystemScriptService, SystemScriptService>(kernel);
            AddBind<IComponentService, ComponentService>(kernel);
            AddBind<ILogFileService, LogFileService>(kernel);
            AddBind<ILogFileReaderService, LogFileReaderService>(kernel);
            AddBind<ICopyrightService, CopyrightService>(kernel);

            NinjectWebCommon.RegisterServices(kernel.Object);

            kernel.Verify(x => x.Bind<IRepositoryLogService>(), Times.Once);
            kernel.Verify(x => x.Bind<ILogFileService>(), Times.Once);
        }

        private void AddBind<TInterface, TConcrete>(Mock<IKernel> kernel)
            where TConcrete : TInterface
        {
            var toObject = new Mock<IBindingWhenInNamedWithOrOnSyntax<TConcrete>>();

            var bindingObject = new Mock<IBindingToSyntax<TInterface>>();
            bindingObject.Setup(x => x.To<TConcrete>()).Returns(toObject.Object);

            kernel.Setup(x => x.Bind<TInterface>()).Returns(bindingObject.Object);
        }
    }
}
