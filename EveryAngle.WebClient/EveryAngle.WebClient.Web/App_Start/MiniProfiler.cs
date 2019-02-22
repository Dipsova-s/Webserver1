using EveryAngle.WebClient.Web.Helpers;
using Microsoft.Web.Infrastructure.DynamicModuleHelper;
using StackExchange.Profiling;
using StackExchange.Profiling.MVCHelpers;
using System;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;

[assembly: WebActivatorEx.PreApplicationStartMethod(
    typeof(EveryAngle.WebClient.Web.App_Start.MiniProfilerPackage), "PreStart")]

[assembly: WebActivatorEx.PostApplicationStartMethod(
    typeof(EveryAngle.WebClient.Web.App_Start.MiniProfilerPackage), "PostStart")]


namespace EveryAngle.WebClient.Web.App_Start
{
    public static class MiniProfilerPackage
    {
        public static void PreStart()
        {

            // Be sure to restart you ASP.NET Developement server, this code will not run until you do that. 
            MiniProfiler.Settings.SqlFormatter = new StackExchange.Profiling.SqlFormatters.SqlServerFormatter();

            //Make sure the MiniProfiler handles BeginRequest and EndRequest
            DynamicModuleUtility.RegisterModule(typeof(MiniProfilerStartupModule));
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
                    HttpResponse response = HttpContext.Current.Response;
                    OutputFilterStream filter = new OutputFilterStream(response.Filter);
                    response.Filter = filter;
                    MiniProfiler.Start();

                };

                context.EndRequest += (sender, e) =>
                {
                    MiniProfiler.Stop();
                };
            }
        }

        public void Dispose()
        {
            // do nothing
        }
    }
}

