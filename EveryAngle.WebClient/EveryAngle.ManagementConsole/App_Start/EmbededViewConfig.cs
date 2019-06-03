using System.Web.Mvc;
using System.Web.WebPages;
using RazorGenerator.Mvc;
using PreApplicationStartCode = System.Web.Mvc.PreApplicationStartCode;

namespace EveryAngle.ManagementConsole.App_Start
{
    public static class EmbededViewConfig
    {
        public static void RegisterCustomViewEngines(ViewEngineCollection viewEngines)
        {
            viewEngines.Clear();
            ViewEngines.Engines.Add(new RazorViewEngine());

            var engine = new PrecompiledMvcEngine(typeof (PreApplicationStartCode).Assembly);
            viewEngines.Add(engine);
            VirtualPathFactoryManager.RegisterVirtualPathFactory(engine);
        }
    }
}
