using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;
using System.Data;
using HarbinCockpit.DBUtility;
using System.Reflection;

namespace HarbinCockpit
{
    public class GetHarbinPMData : IHttpHandler
    {
        public bool IsReusable
        {
            get { return true; }
        }
        /*Request Parameter      
         */
        private string timeUnit = "hour";
        private int pointCount = 13;
        private string dataFormat = "line";

        private int lineCount = 2;

        /******/

        public void ProcessRequest(HttpContext context)
        {
            timeUnit = context.Request.QueryString["timeunit"];
            timeUnit = timeUnit == null ? "hour" : timeUnit.ToLower();

            lineCount = Convert.ToInt32(context.Request.QueryString["linecount"]);
            lineCount = lineCount <= 0 ? 2 : lineCount;
            pointCount = Convert.ToInt32(context.Request.QueryString["pointcount"]);
            pointCount = pointCount <= 0 ? 13 : pointCount;
            dataFormat = context.Request.QueryString["dataformat"] ?? "line";

            switch (timeUnit)
            {
                case "hour":
                    {
                        GetDataByHours(context, null);
                        break;
                    }
                case "day":
                    {
                        GetDataByDay(context);
                        break;
                    }
                case "map":
                    {
                        Map(context);
                        break;
                    }
                default:
                    {
                        HotWord(context);
                        break;
                    }
            }

        }
        public void GetDataByHours1(HttpContext context)
        {
            var request = context.Request;
            var response = context.Response;
            response.ContentType = "text/html";
            Func<double, DateTime> func = DateTime.Now.AddHours;

            List<HeartbeatEntry> hList = new List<HeartbeatEntry>();
            string[] keys = new string[pointCount + 1];
            string key = string.Empty;
            Random rd = new Random();
            int max = 500;
            int min = 0;
            List<ArrayList> links = new List<ArrayList>();
            for (int i = 0; i < lineCount; i++)
            {
                if (i == 0)
                {
                    max = 500;
                    min = 200;
                }
                else
                {
                    max = 120;
                    min = 0;
                }
                ArrayList alist = new ArrayList();
                for (int j = pointCount; j >= 0; j--)
                {
                    DateTime dkey = func(0 - Convert.ToDouble(j));
                    keys[j] = keys[j] ?? dkey.ToString("HH:00");
                    key = keys[j];
                    string value = rd.Next(min, max).ToString();
                    HeartbeatEntry hbEntry = new HeartbeatEntry()
                    {
                        key = key,
                        value = value,
                        links = new List<Link>() 
                        { 
                            new Link()
                            {
                                url=@"http://www.baidu.com",
                                text=value
                            },
                            new Link()
                            {
                                url = @"http://www.sina.com",
                                text = value + "1"
                            },
                            new Link()
                            {
                                url = @"http://www.qq.com",
                                text = value + "2"
                            }         
                                 
                        }
                    };
                    alist.Add(hbEntry);
                }
                links.Add(alist);
                hList.Add(alist[alist.Count - 1] as HeartbeatEntry);
            }

            JavaScriptSerializer jss = new JavaScriptSerializer();

            var result = "";
            if (dataFormat == "line")
            {

                result = jss.Serialize(links);
            }
            else
            {

                result = jss.Serialize(hList);
            }
            response.Write(result);

        }

        public void GetDataByHours(HttpContext context, string[] fieldName)
        {
            var request = context.Request;
            var response = context.Response;
            response.ContentType = "text/html";
            var result = "";
            try
            {
                DbHelper helper = DbHelperFactory.CreateHelper();
                DataSet ds = helper.Query(System.Configuration.ConfigurationManager.AppSettings["heartbeatLineQuerySql"]);
                var tx = ds.Tables[0].AsEnumerable();
                fieldName = fieldName != null && fieldName.Length > 0 ? fieldName : new string[] { "score", "aqi" };
                ArrayList listCols = new ArrayList();
                List<HeartbeatEntry> hlist = new List<HeartbeatEntry>();
                for (var i = 0; i < fieldName.Length; i++)
                {
                    List<HeartbeatEntry> list = (from c in tx
                                                 group c by new { key = c.Field<object>("date_time"), value = c.Field<object>(fieldName[i]) } into g
                                                 select new HeartbeatEntry
                                                 {
                                                     key = g.Key.key.ToString(),
                                                     value = g.Key.value.ToString(),
                                                     links = (from p in g
                                                              select new Link
                                                              {
                                                                  text = p.Field<object>("url_title").ToString(),
                                                                  url = p.Field<object>("url_path").ToString()

                                                              }).AsEnumerable<Link>()
                                                 }).ToList<HeartbeatEntry>();
                    listCols.Add(list);
                    hlist.Add(list[list.Count - 1]);
                }

                JavaScriptSerializer jss = new JavaScriptSerializer();

                if (dataFormat == "line")
                {

                    result = jss.Serialize(listCols);
                }
                else
                {

                    result = jss.Serialize(hlist);

                }

            }
            catch (Exception e)
            {
                result = "{\"error\":\"" + e.Message + "\"}";
            }
            response.Write(result);
        }
        public void GetDataByDay(HttpContext context)
        {
            GetDataByHours(context, new string[] { "aqi" });
        }
        public void GetDataByDay1(HttpContext context)
        {
            Func<double, DateTime> func = DateTime.Now.AddDays;
            var request = context.Request;
            var response = context.Response;
            response.ContentType = "text/html";


            List<HeartbeatEntry> hList = new List<HeartbeatEntry>();
            string[] keys = new string[pointCount + 1];
            string key = string.Empty;
            Random rd = new Random();
            int max = 500;
            int min = 0;
            List<ArrayList> links = new List<ArrayList>();
            for (int i = 0; i < lineCount; i++)
            {

                max = 120;
                min = 0;


                ArrayList alist = new ArrayList();
                for (int j = pointCount; j >= 0; j--)
                {
                    DateTime dkey = func(0 - Convert.ToDouble(j));
                    keys[j] = keys[j] ?? dkey.ToString("MM-dd");
                    key = keys[j];
                    string value = rd.Next(min, max).ToString();



                    HeartbeatEntry hbEntry = new HeartbeatEntry()
                    {
                        key = key,
                        value = value,
                        links = new List<Link>() 
                        { 
                            new Link()
                            {
                                url=@"http://www.baidu.com",
                                text=value
                            },
                            new Link()
                            {
                                url = @"http://www.sina.com",
                                text = value + "1"
                            },
                            new Link()
                            {
                                url = @"http://www.qq.com",
                                text = value + "2"
                            }         
                                 
                        }
                    };
                    alist.Add(hbEntry);

                }
                hList.Add(alist[alist.Count - 1] as HeartbeatEntry);
                links.Add(alist);
            }

            JavaScriptSerializer jss = new JavaScriptSerializer();

            var result = "";
            if (dataFormat == "line")
            {

                result = jss.Serialize(links);
            }
            else
            {
                result = jss.Serialize(hList);
            }
            response.Write(result);
        }

        public void Map(HttpContext context)
        {
            DbHelper helper = DbHelperFactory.CreateHelper();
            DataSet ds = helper.Query(System.Configuration.ConfigurationManager.AppSettings["mapQuerySql"]);
            var tx = ds.Tables[0].AsEnumerable();

            var list = from c in tx
                       select CreateModel<Map>(c);

            JavaScriptSerializer jss = new JavaScriptSerializer();

            var result = jss.Serialize(list);

            context.Response.Write(result);


        }

        public void HotWord(HttpContext context)
        {
            DbHelper helper = DbHelperFactory.CreateHelper();
            DataSet ds = helper.Query(System.Configuration.ConfigurationManager.AppSettings["hotWordQuerySql"]);
            var tx = ds.Tables[0].AsEnumerable();

            var list = from c in tx
                       select CreateModel<HotWord>(c);

            JavaScriptSerializer jss = new JavaScriptSerializer();

            var result = jss.Serialize(list);

            context.Response.Write(result);
        }

        private T CreateModel<T>(DataRow c)
        {
            Type objType = typeof(T);

            ConstructorInfo constructor = objType.GetConstructor(new Type[] { });
            T objModel = (T)constructor.Invoke(new object[] { });
            var properties = objType.GetProperties();
            string value = "";
            foreach (PropertyInfo p in properties)
            {
                value = c.Field<object>(((System.Reflection.MemberInfo)(p)).Name).ToString();
                p.SetValue(objModel, value);
            }
            return objModel;
        }

    }

    public class HeartbeatEntry
    {
        public string key { get; set; }
        public string value { get; set; }
        public IEnumerable<Link> links { set; get; }
    }
    public class Link
    {

        public string url { get; set; }
        public string text { get; set; }
    }
    public class Map
    {
        public string Aqi { get; set; }
        public string Area { get; set; }
        public string Co_24h { get; set; }
        public string No2 { get; set; }
        public string No2_24h { get; set; }
        public string O3 { get; set; }
        public string O3_24h { get; set; }
        public string O3_8h { get; set; }
        public string O3_8h_24h { get; set; }
        public string Pm10 { get; set; }
        public string Pm10_24h { get; set; }
        public string Pm2_5 { get; set; }
        public string pm2_5_24h { get; set; }
        public string Position_name { get; set; }
        public string Primary_pollutant { get; set; }
        public string Quality { get; set; }
        public string So2_24h { get; set; }
        public string So2 { get; set; }
        public string Station_code { get; set; }
        public string Time_point { get; set; }
        public string Lat { get; set; }
        public string lng { get; set; }
    }
    public class HotWord
    {
        public string Word_name { get; set; }
        public string Word_count { get; set; }
    }
}