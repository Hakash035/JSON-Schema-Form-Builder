export interface SchemaExample {
  id: string;
  title: string;
  description: string;
  category: string;
  schema: object;
}

export const schemaExamples: SchemaExample[] = [
  {
    id: '7732145d-fe97-46e7-ba2e-accdc7820589',
    title: 'Basic Contact Form',
    description: 'Simple form with name, email, and phone validation',
    category: 'Basic',
    schema: {
      title: 'Basic Contact Form',
      type: 'object',
      required: ['name', 'email'],
      properties: {
        name: {
          type: 'string',
          title: 'Full Name',
          minLength: 2,
          maxLength: 100
        },
        email: {
          type: 'string',
          title: 'Email Address',
          format: 'email'
        },
        phone: {
          type: 'string',
          title: 'Phone Number',
          pattern: '^[+]?[1-9]?[0-9]{7,15}$'
        },
        message: {
          type: 'string',
          title: 'Message',
          maxLength: 500
        }
      }
    }
  },
  {
    id: '74a53cde-e670-4978-8ac3-63979607e417',
    title: 'Nested Object + Array',
    description: 'Education details with nested objects and skill arrays',
    category: 'Advanced',
    schema: {
      title: 'Education & Skills Profile',
      type: 'object',
      required: ['education', 'skills'],
      properties: {
        education: {
          type: 'object',
          title: 'Education Details',
          required: ['degree', 'institution', 'year'],
          properties: {
            degree: {
              type: 'string',
              title: 'Degree',
              enum: ['Bachelor\'s', 'Master\'s', 'PhD', 'Associate', 'Certificate']
            },
            institution: {
              type: 'string',
              title: 'Institution Name',
              minLength: 2
            },
            year: {
              type: 'integer',
              title: 'Graduation Year',
              minimum: 1950,
              maximum: 2030
            },
            gpa: {
              type: 'number',
              title: 'GPA (Optional)',
              minimum: 0,
              maximum: 4.0
            }
          }
        },
        skills: {
          type: 'array',
          title: 'Technical Skills',
          minItems: 1,
          maxItems: 10,
          items: {
            type: 'string',
            enum: ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'Java', 'C++', 'SQL', 'Docker', 'AWS']
          }
        }
      }
    }
  },
  {
    id: 'be87823e-00ff-4776-874f-599748c5d51d',
    title: 'Array of Objects',
    description: 'Work experience with repeating job entries',
    category: 'Advanced',
    schema: {
      title: 'Work Experience',
      type: 'object',
      required: ['experience'],
      properties: {
        currentlyEmployed: {
          type: 'boolean',
          title: 'Currently Employed'
        },
        experience: {
          type: 'array',
          title: 'Work Experience',
          minItems: 1,
          items: {
            type: 'object',
            required: ['company', 'role', 'startDate'],
            properties: {
              company: {
                type: 'string',
                title: 'Company Name',
                minLength: 2
              },
              role: {
                type: 'string',
                title: 'Job Title',
                minLength: 2
              },
              startDate: {
                type: 'string',
                title: 'Start Date (YYYY-MM-DD)',
                format: 'date'
              },
              endDate: {
                type: 'string',
                title: 'End Date (Optional)',
                format: 'date'
              },
              description: {
                type: 'string',
                title: 'Job Description',
                maxLength: 500
              }
            }
          }
        }
      }
    }
  },
  {
    id: '685955f9-dba4-47b4-872a-25731c4dfcaa',
    title: 'Conditional Required Fields',
    description: 'Fields become required based on other selections',
    category: 'Conditional',
    schema: {
      title: 'Developer Profile',
      type: 'object',
      required: ['name'],
      properties: {
        name: {
          type: 'string',
          title: 'Full Name',
          minLength: 2
        },
        hasGithub: {
          type: 'string',
          title: 'Do you have a GitHub profile?',
          enum: [
            "Yes, I do", 
            "No, I don't"
          ]
        },
        experienceLevel: {
          type: 'string',
          title: 'Experience Level',
          enum: ['Junior', 'Mid-level', 'Senior', 'Lead']
        }
      },
      if: {
        properties: { hasGithub: { const: "Yes, I do" } }
      },
      then: {
        properties: {
          githubUrl: {
            type: 'string',
            title: 'GitHub URL',
            pattern: '^https://github.com/.+',
            description: 'Must be a valid GitHub profile URL'
          }
        },
        required: ['githubUrl']
      },
      else: {
        properties: {
          portfolioUrl: {
            type: 'string',
            title: 'Portfolio Website',
            format: 'uri',
            description: 'Link to your portfolio or personal website'
          }
        }
      }
    }
  },
  {
    id: '5e7b48fd-a2be-40c5-89ef-f8b4bc40e4bb',
    title: 'Conditional Field Visibility',
    description: 'Different fields appear based on user choices',
    category: 'Conditional',
    schema: {
      title: 'Event Registration',
      type: 'object',
      required: ['name', 'attendanceType'],
      properties: {
        name: {
          type: 'string',
          title: 'Full Name',
          minLength: 2
        },
        attendanceType: {
          type: 'string',
          title: 'How will you attend?',
          enum: ['in-person', 'virtual']
        }
      },
      if: {
        properties: { attendanceType: { const: 'in-person' } }
      },
      then: {
        properties: {
          dietaryRestrictions: {
            type: 'string',
            title: 'Dietary Restrictions',
            enum: ['None', 'Vegetarian', 'Vegan', 'Gluten-free', 'Other']
          },
          tshirtSize: {
            type: 'string',
            title: 'T-shirt Size',
            enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
          }
        },
        required: ['dietaryRestrictions', 'tshirtSize']
      },
      else: {
        properties: {
          timezone: {
            type: 'string',
            title: 'Your Timezone',
            enum: ['UTC-8 (PST)', 'UTC-5 (EST)', 'UTC+0 (GMT)', 'UTC+1 (CET)', 'UTC+8 (CST)']
          },
          internetSpeed: {
            type: 'string',
            title: 'Internet Connection',
            enum: ['High-speed', 'Standard', 'Limited']
          }
        },
        required: ['timezone']
      }
    }
  }
];

export const getSchemaById = (id: string): SchemaExample | undefined => {
  return schemaExamples.find(example => example.id === id);
};

export const getSchemasByCategory = (category: string): SchemaExample[] => {
  return schemaExamples.filter(example => example.category === category);
};