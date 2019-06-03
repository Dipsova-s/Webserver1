using RazorGenerator.Mvc;
using System.Web.Mvc;
using System.Web.WebPages;


namespace EveryAngle.WebClient.Web.App_Start
{
    public static class EmbededViewConfig
    {
        public static void RegisterCustomViewEngines(ViewEngineCollection viewEngines)
        {
            viewEngines.Clear();
            ViewEngines.Engines.Add(new RazorViewEngine());

            var engine = new PrecompiledMvcEngine(typeof(System.Web.Mvc.PreApplicationStartCode).Assembly);
            viewEngines.Add(engine);
            VirtualPathFactoryManager.RegisterVirtualPathFactory(engine);
        }
    }
}
