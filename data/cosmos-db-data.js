// author: Gary A. Stafford
// site: https://programmaticponderings.com
// license: MIT License
// description: Azure Tech Facts LUIS-enabled Chatbot

// Reference: https://docs.microsoft.com/en-us/azure/cosmos-db/mongodb-samples
// Insert Azure Facts into Cosmos DB azuretechfacts Collection

'use strict';

/* CONSTANTS */
const mongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const COSMOS_DB_CONN_STR = process.env.COSMOS_DB_CONN_STR;

const DB_COLLECTION = "azuretechfacts";

const azureFacts = [
    {
        "fact": "categories",
        "title": "Product Categories",
        "image": "image-04.png",
        "response": "Microsoft Azure offer eighteen categories of products, including Compute, Containers, Databases, Mobile, Networking, and Security."
    },
    {
        "fact": "certifications",
        "title": "Azure Certifications",
        "image": "image-06.png",
        "response": "As of June 2018, Microsoft offered ten Azure certification exams, allowing IT professionals the ability to differentiate themselves and validate their knowledge and skills."
    },
    {
        "fact": "cognitive",
        "title": "Cognitive Services",
        "image": "image-09.png",
        "response": "Azure's intelligent algorithms allow apps to see, hear, speak, understand and interpret user needs through natural methods of communication."
    },
    {
        "fact": "competition",
        "title": "Azure's Competition",
        "image": "image-05.png",
        "response": "According to the G2 Crowd website, Azure's Cloud competitors include Amazon Web Services (AWS), Digital Ocean, Google Compute Engine (GCE), and Rackspace."
    },
    {
        "fact": "compliance",
        "title": "Compliance",
        "image": "image-06.png",
        "response": "Microsoft provides the most comprehensive set of compliance offerings (including certifications and attestations) of any cloud service provider."
    },
    {
        "fact": "cosmos",
        "title": "Azure Cosmos DB",
        "image": "image-17.png",
        "response": "According to Microsoft, Cosmos DB is a globally distributed, multi-model database service, designed for low latency and scalable applications anywhere in the world, with native support for NoSQL."
    },
    {
        "fact": "description",
        "title": "What is Azure?",
        "image": "image-01.png",
        "response": "According to Wikipedia, Microsoft Azure is a cloud computing service created by Microsoft for building, testing, deploying, and managing applications and services through a global network of Microsoft-managed data centers."
    },
    {
        "fact": "first",
        "title": "Azure SQL",
        "image": "image-08.png",
        "response": "According to Wikipedia, Microsoft announced SQL Azure Relational Database in March, 2009. Other early Azure products included AppFabric Service Bus, Access Control, and Windows Azure Drive, According to Microsoft."
    },
    {
        "fact": "functions",
        "title": "Azure Functions",
        "image": "image-14.png",
        "response": "According to Microsoft, Azure Functions is a serverless compute service that enables you to run code on-demand without having to explicitly provision or manage infrastructure."
    },
    {
        "fact": "geographies",
        "title": "Azure Geography",
        "image": "image-07.png",
        "response": "According to Microsoft, Azure regions are organized into geographies. An Azure geography ensures that data residency, sovereignty, compliance, and resiliency requirements are honored within geographical boundaries."
    },
    {
        "fact": "global",
        "title": "Azure Regions",
        "image": "image-02.png",
        "response": "According to Microsoft, as of June, 2018, with 54 Azure regions, Azure has more global regions than any other cloud provider. Azure is currently available in 140 countries."
    },
    {
        "fact": "kubernetes",
        "title": "Azure Kubernetes Service (AKS)",
        "image": "image-18.png",
        "response": "According to Microsoft, Azure Kubernetes Service (AKS) is a fully managed Kubernetes container orchestration service, which simplifies Kubernetes management, deployment, and operations."
    },
    {
        "fact": "platforms",
        "title": "Product Categories",
        "image": "image-10.png",
        "response": "According to Wikipedia, Azure provides Software as a Service (SaaS), Containers as a Service (CaaS), Platform as a Service (PaaS), and Infrastructure as a Service (IaaS)."
    },
    {
        "fact": "products",
        "title": "Azure Products",
        "image": "image-12.png",
        "response": "Microsoft offers over 500 products within eighteen categories, including Machine Learning, Analytics, Functions, Containers, CosmosDB, and Visual Studio Team Services."
    },
    {
        "fact": "regions",
        "title": "Global Network",
        "image": "image-13.png",
        "response": "According to Microsoft, an Azure region is a set of datacenters deployed within a latency-defined perimeter and connected through a dedicated regional low-latency network."
    },
    {
        "fact": "released",
        "title": "First Released",
        "image": "image-11.png",
        "response": "According to Wikipedia, Azure was released on February 1, 2010 as 'Windows Azure' before being renamed 'Microsoft Azure' on March 25, 2014."
    }
];

const insertDocuments = function (db, callback) {
    db.collection(DB_COLLECTION).insertMany(azureFacts, function (err, result) {
        assert.equal(err, null);
        console.log(`Inserted documents into the ${DB_COLLECTION} collection.`);
        callback();
    });
};

const findDocuments = function (db, callback) {
    const cursor = db.collection(DB_COLLECTION).find();
    cursor.each(function (err, doc) {
        assert.equal(err, null);
        if (doc != null) {
            console.dir(doc);
        } else {
            callback();
        }
    });
};

const deleteDocuments = function (db, callback) {
    db.collection(DB_COLLECTION).deleteMany(
        {},
        function (err, results) {
            console.log(results);
            callback();
        }
    );
};

mongoClient.connect(COSMOS_DB_CONN_STR, function (err, client) {
    assert.equal(null, err);
    const db = client.db(DB_COLLECTION);
    deleteDocuments(db, function () {
        insertDocuments(db, function () {
            findDocuments(db, function () {
                client.close();
            });
        });
    });
});
