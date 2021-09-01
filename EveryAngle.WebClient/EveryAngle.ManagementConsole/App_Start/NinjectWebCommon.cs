using System;
using System.Web;
using EveryAngle.Core.Interfaces.Services;
using EveryAngle.ManagementConsole.App_Start;
using EveryAngle.ManagementConsole.Helpers;
using EveryAngle.ManagementConsole.Helpers.AngleWarnings;
using EveryAngle.Shared.Helpers;
using EveryAngle.WebClient.Service.ApiServices;
using EveryAngle.WebClient.Service.ApplicationServices;
using EveryAngle.WebClient.Service.WebClientConfigs;
using Microsoft.Web.Infrastructure.DynamicModuleHelper;
using Ninject;
using Ninject.Web.Common;

[assembly: WebActivatorEx.PreApplicationStartMethod(typeof(NinjectWebCommon), "Start")]
[assembly: WebActivatorEx.ApplicationShutdownMethod(typeof(NinjectWebCommon), "Stop")]

namespace EveryAngle.ManagementConsole.App_Start
{
    public static class NinjectWebCommon
    {
        private static readonly Bootstrapper bootstrapper = new Bootstrapper();

        /// <summary>
        ///     Starts the application
        /// </summary>
        public static void Start()
        {
            DynamicModuleUtility.RegisterModule(typeof(OnePerRequestHttpModule));
            DynamicModuleUtility.RegisterModule(typeof(NinjectHttpModule));
            bootstrapper.Initialize(CreateKernel);
        }

        /// <summary>
        ///     Stops the application.
        /// </summary>
        public static void Stop()
        {
            bootstrapper.ShutDown();
        }

        /// <summary>
        ///     Creates the kernel that will manage your application.
        /// </summary>
        /// <returns>The created kernel.</returns>
        private static IKernel CreateKernel()
        {
            var kernel = new StandardKernel();
            kernel.Bind<Func<IKernel>>().ToMethod(ctx => () => new Bootstrapper().Kernel);
            kernel.Bind<IHttpModule>().To<HttpApplicationInitializationHttpModule>();

            RegisterServices(kernel);
            return kernel;
        }

        /// <summary>
        ///     Load your modules or register your services here!
        /// </summary>
        /// <param name="kernel">The kernel.</param>
        public static void RegisterServices(IKernel kernel)
        {
            kernel.Bind<IModelService>()
                .To<ModelService>()
                .WithPropertyValue("WebServiceUri", UrlHelper.GetRequestUrl(URLType.NOA));
            kernel.Bind<IDirectoryService>()
                .To<DirectoryService>()
                .WithPropertyValue("WebServiceUri", UrlHelper.GetRequestUrl(URLType.NOA));
            kernel.Bind<IUserService>()
                .To<UserService>()
                .WithPropertyValue("WebServiceUri", UrlHelper.GetRequestUrl(URLType.NOA));
            kernel.Bind<IModelAgentService>().To<ModelAgentService>();
            kernel.Bind<ICommentService>().To<CommentService>();
            kernel.Bind<IGlobalSettingService>().To<GlobalSettingService>();
            kernel.Bind<ILabelService>().To<LabelService>();
            kernel.Bind<ISystemInformationService>().To<SystemInformationService>();
            kernel.Bind<ISessionService>().To<SessionService>();
            kernel.Bind<IDownloadTableService>().To<DownloadTableService>();
            kernel.Bind<IWebClientConfigService>().To<WebClientConfigService>();
            kernel.Bind<IAutomationTaskService>().To<AutomationTaskService>();
            kernel.Bind<ITaskService>().To<TaskService>();
            kernel.Bind<IPackageService>().To<PackageService>();
            kernel.Bind<IFacetService>().To<FacetService>();
            kernel.Bind<IRepositoryLogService>().To<RepositoryLogService>();
            kernel.Bind<IItemService>().To<ItemService>();
            kernel.Bind<ISystemScriptService>().To<SystemScriptService>();
            kernel.Bind<IComponentService>().To<ComponentService>();
            kernel.Bind<ILogFileService>().To<LogFileService>();
            kernel.Bind<ILogFileReaderService>().To<LogFileReaderService>();
            kernel.Bind<IGlobalSettingsAppService>().To<GlobalSettingsAppService>();
            kernel.Bind<ICopyrightService>().To<CopyrightService>();
            kernel.Bind<IFileTemplateService>().To<ExcelTemplatesService>();
            kernel.Bind<IAngleWarningsFileReader>().To<AngleWarningsFileReader>();
            kernel.Bind<IAngleWarningsContentInputter>().To<AngleWarningsContentInputter>();
            kernel.Bind<IFileHelper>().To<FileHelper>();
            kernel.Bind<IAngleWarningsAutoSolver>().To<AngleWarningsAutoSolver>();
            kernel.Bind<IClassReferencesManager>().To<ClassReferencesManager>();
        }
    }
}
