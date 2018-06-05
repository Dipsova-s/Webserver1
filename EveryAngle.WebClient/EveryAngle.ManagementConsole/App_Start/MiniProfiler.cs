using System;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using EveryAngle.ManagementConsole.App_Start;
using Microsoft.Web.Infrastructure.DynamicModuleHelper;
using StackExchange.Profiling;
using StackExchange.Profiling.MVCHelpers;
using StackExchange.Profiling.SqlFormatters;
using EveryAngle.ManagementConsole.Helpers;

[assembly: WebActivatorEx.PreApplicationStartMethod(
    typeof (MiniProfilerPackage), "PreStart")]
[assembly: WebActivatorEx.PostApplicationStartMethod(
    typeof (MiniProfilerPackage), "PostStart")]

namespace EveryAngle.ManagementConsole.App_Start
{
    public static class MiniProfilerPackage
    {
        public static void PreStart()
        {
            MiniProfiler.Settings.SqlFormatter = new SqlServerFormatter();
            DynamicModuleUtility.RegisterModule(typeof (MiniProfilerStartupModule));
            GlobalFilters.Filters.Add(new ProfilingActionFilter());
        }

        public static void PostStart()
        {
            // Intercept ViewEngines to profile all partial views and regular views.
            // If you prefer to insert your profiling blocks manually you can comment this out
            var copy = ViewEngines.Engines.ToList();
            ViewEngines.Engines.Clear();
            foreach (var item in copy)
            {
                ViewEngines.Engines.Add(new ProfilingViewEngine(item));
            }
        }
    }

    public class MiniProfilerStartupModule : IHttpModule
    {
        public void Init(HttpApplication context)
        {
            if (Convert.ToBoolean(ConfigurationManager.AppSettings["EnableMiniprofiler"]))
            {
                context.BeginRequest += (sender, e) =>
                {
                    var request = ((HttpApplication) sender).Request;

                    var response = HttpContext.Current.Response;
                    var filter = new OutputFilterStream(response.Filter);
                    response.Filter = filter;
                    MiniProfiler.Start();
                };

                context.EndRequest += (sender, e) => { MiniProfiler.Stop(); };
            }
        }

        public void Dispose()
        {
            // do nothing
        }
    }
}
