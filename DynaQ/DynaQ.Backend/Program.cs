using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.Extensions.NETCore.Setup;
using Amazon.Runtime;
using DynaQ.Backend.Infrastructure;
using DynaQ.Backend.Services;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.Swagger;
using Swashbuckle.AspNetCore.SwaggerGen;
using Swashbuckle.AspNetCore.SwaggerUI;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Configure Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "DynaQ API",
        Version = "v1",
        Description = "API for managing projects, ads, surveys, and tracking events",
        Contact = new OpenApiContact
        {
            Name = "DynaQ Team"
        }
    });
    
    // Enable XML comments in Swagger UI
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
		policy.AllowAnyOrigin()
			  .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Configure AWS DynamoDB
if (builder.Environment.IsDevelopment() && builder.Configuration.GetValue<bool>("AWS:DynamoDb:LocalMode"))
{
    // Use DynamoDB Local in development mode
    var serviceUrl = builder.Configuration.GetValue<string>("AWS:DynamoDb:LocalServiceUrl");
    
    Console.WriteLine($"Using DynamoDB Local at {serviceUrl}");
    
    // Configure DynamoDB to use local instance
    builder.Services.AddSingleton<IAmazonDynamoDB>(sp =>
    {
        var clientConfig = new AmazonDynamoDBConfig
        {
            ServiceURL = serviceUrl,
            UseHttp = true
        };
        
        // Use dummy credentials for local development
        return new AmazonDynamoDBClient(
            new BasicAWSCredentials("dummy", "dummy"), 
            clientConfig);
    });
}
else
{
    // Use standard AWS configuration for production
    builder.Services.AddDefaultAWSOptions(builder.Configuration.GetAWSOptions());
    builder.Services.AddAWSService<IAmazonDynamoDB>();
}

// Register DynamoDB context
builder.Services.AddScoped<IDynamoDBContext, DynamoDBContext>();

// Register services
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IAdService, AdService>();
builder.Services.AddScoped<ITrackingService, TrackingService>();
builder.Services.AddScoped<ISurveyService, SurveyService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // Enable Swagger UI in development
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "DynaQ API v1");
        c.RoutePrefix = string.Empty; // Set Swagger UI at the app's root
    });
    
    // Create DynamoDB tables in development mode
    if (app.Configuration.GetValue<bool>("AWS:DynamoDb:LocalMode"))
    {
        // Create DynamoDB tables if they don't exist
        try
        {
            var dynamoDb = app.Services.GetRequiredService<IAmazonDynamoDB>();
            DynamoDbInitializer.EnsureTablesExistAsync(dynamoDb).GetAwaiter().GetResult();
            Console.WriteLine("DynamoDB tables initialized successfully");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error initializing DynamoDB tables: {ex.Message}");
            Console.WriteLine("Make sure DynamoDB Local is running on the specified port.");
        }
    }
}

// Use CORS before other middleware
app.UseCors("AllowFrontend");

// Remove HTTPS redirection to avoid preflight issues
// app.UseHttpsRedirection();

app.MapControllers();

app.Run();
