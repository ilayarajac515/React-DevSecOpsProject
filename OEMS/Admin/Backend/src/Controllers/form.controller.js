import { connection } from "../server.js";
import {
  BAD_REQUEST,
  SERVER_ERROR,
  STATUS_OK,
  NOT_FOUND,
} from "../Constants/httpStatus.js";
import { uploadImageToCloudinary } from "../Utils/cloudinary.helper.js";

export const getFields = (req, res) => {
  const { formId } = req.params;

  if (!formId) {
    return res.status(BAD_REQUEST).json({ message: "formId is required" });
  }

  connection.query(
    "SELECT * FROM FieldTable WHERE formId = ?",
    [formId],
    (err, results) => {
      if (err) {
        console.error("Error fetching fields:", err);
        return res.status(SERVER_ERROR).json({ error: "Server error" });
      }
      res.status(STATUS_OK).json(results);
    }
  );
};

export const getForms = (req, res) => {
  connection.query("SELECT * FROM FormTable", (err, results) => {
    if (err) {
      console.error("Error fetching forms:", err);
      return res.status(SERVER_ERROR).json({ error: "Server error" });
    }

    res.status(STATUS_OK).json(results);
  });
};

export const updateField = (req, res) => {
  const { formId, fieldId } = req.params;
  const { label, placeholder, options, rta } = req.body;

  if (!formId || !fieldId) {
    return res
      .status(BAD_REQUEST)
      .json({ message: "formId and fieldId are required" });
  }

  if (!label) {
    return res
      .status(BAD_REQUEST)
      .json({ message: "Type, label, and placeholder are required" });
  }

  connection.query(
    "UPDATE FieldTable SET label = ?, placeholder = ?, options = ?, rta = ? WHERE formId = ? AND fieldId = ?",
    [
      label,
      placeholder || null,
      JSON.stringify(options),
      JSON.stringify(rta),
      formId,
      fieldId,
    ],
    (err, results) => {
      if (err) {
        console.error("Error updating field:", err);
        return res.status(SERVER_ERROR).json({ error: "Server error" });
      }

      if (results.affectedRows === 0) {
        return res.status(NOT_FOUND).json({ message: "Field not found" });
      }

      res.status(STATUS_OK).json({ message: "Field updated successfully" });
    }
  );
};

export const deleteField = (req, res) => {
  const { formId, fieldId } = req.params;

  if (!formId || !fieldId) {
    return res
      .status(BAD_REQUEST)
      .json({ message: "formId and fieldId are required" });
  }

  connection.query(
    "DELETE FROM FieldTable WHERE formId = ? AND fieldId = ?",
    [formId, fieldId],
    (err, results) => {
      if (err) {
        console.error("Error deleting field:", err);
        return res.status(SERVER_ERROR).json({ error: "Server error" });
      }

      if (results.affectedRows === 0) {
        return res.status(NOT_FOUND).json({ message: "Field not found" });
      }

      res.status(STATUS_OK).json({ message: "Field deleted successfully" });
    }
  );
};

export const addField = (req, res) => {
  const { formId } = req.params;
  const { fieldId, type, label, placeholder, options, rta } = req.body;

  if (!formId || !type || !label) {
    return res
      .status(BAD_REQUEST)
      .json({ message: "Required fields are missing" });
  }

  const query = `
      INSERT INTO FieldTable (fieldId, formId, type, label, placeholder, options, rta)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

  connection.query(
    query,
    [
      fieldId,
      formId,
      type,
      label,
      placeholder || null,
      JSON.stringify(options || {}),
      JSON.stringify(rta || {}),
    ],
    (err, results) => {
      if (err) {
        console.error("Error inserting field:", err);
        return res.status(SERVER_ERROR).json({ error: "Server error" });
      }

      res
        .status(STATUS_OK)
        .json({ message: "Field added successfully", fieldId });
    }
  );
};

export const createForm = (req, res) => {
  const {
    formId,
    label,
    description,
    manager,
    startContent,
    endContent,
    duration,
    status,
  } = req.body;

  if (!label || !duration || !manager || !formId) {
    return res.status(BAD_REQUEST).json({ message: "Missing required fields" });
  }

  const insertQuery = `
    INSERT INTO FormTable (
      formId, label, description, startContent, endContent, duration, manager, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    insertQuery,
    [
      formId,
      label || null,
      description,
      startContent || null,
      endContent || null,
      duration,
      manager,
      status,
    ],
    (err, results) => {
      if (err) {
        console.error("Error creating form:", err);
        return res.status(SERVER_ERROR).json({ error: "Server error" });
      }

      const sanitizedFormId = formId.replace(/[^a-zA-Z0-9_]/g, "_");

      const candidateTable = `selectedCandidate_${sanitizedFormId}`;
      const createCandidateTableQuery = `
        CREATE TABLE IF NOT EXISTS \`${candidateTable}\` (
          id INT AUTO_INCREMENT PRIMARY KEY,
          formId VARCHAR(36) NOT NULL,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          mobile VARCHAR(15) UNIQUE NOT NULL,
          degree VARCHAR(50) NOT NULL,
          department VARCHAR(50) NOT NULL,
          degree_percentage DECIMAL(5,2) NOT NULL,
          sslc_percentage DECIMAL(5,2) NOT NULL,
          hsc_percentage DECIMAL(5,2) NOT NULL,
          location VARCHAR(100) NOT NULL,
          relocate VARCHAR(100) NOT NULL,
          FOREIGN KEY (formId) REFERENCES FormTable(formId) ON DELETE CASCADE
        )
      `;

      connection.query(createCandidateTableQuery, (err2, results2) => {
        if (err2) {
          console.error("Error creating candidate table:", err2);
          return res
            .status(SERVER_ERROR)
            .json({ error: "Error creating candidate table" });
        }

        const valueTable = `valueTable_${sanitizedFormId}`;
        const createValueTableQuery = `
          CREATE TABLE IF NOT EXISTS \`${valueTable}\` (
            id INT PRIMARY KEY AUTO_INCREMENT,
            responseId VARCHAR(36) UNIQUE,
            formId VARCHAR(36),
            value JSON,
            userEmail VARCHAR(36) UNIQUE NOT NULL,
            startTime VARCHAR(36),
            endTime VARCHAR(36),
            duration VARCHAR(36),
            score VARCHAR(36),
            status VARCHAR(36) DEFAULT 'Not Submitted',
            termsAccepted VARCHAR(36),
            warnings INT,
            Timer VARCHAR(36),
            FOREIGN KEY (formId) REFERENCES FormTable(formId) ON DELETE CASCADE
          )
        `;

        connection.query(createValueTableQuery, (err3, results3) => {
          if (err3) {
            console.error("Error creating value table:", err3);
            return res
              .status(SERVER_ERROR)
              .json({ error: "Error creating value table" });
          }

          res.status(STATUS_OK).json({
            message:
              "Form, candidate table, and value table created successfully",
            formId,
          });
        });
      });
    }
  );
};

export const insertSelectedCandidates = (req, res) => {
  const { formId } = req.params;
  const candidates = req.body.candidates;

  if (!formId || !Array.isArray(candidates) || candidates.length === 0) {
    return res
      .status(BAD_REQUEST)
      .json({ message: "formId and candidates are required" });
  }

  const sanitizedFormId = formId.replace(/[^a-zA-Z0-9_]/g, "_");
  const tableName = `selectedCandidate_${sanitizedFormId}`;

  const insertQuery = `
    INSERT INTO \`${tableName}\` (
      formId, name, email, mobile, degree, department,
      degree_percentage, sslc_percentage, hsc_percentage,
      location, relocate
    ) VALUES ?
  `;

  const values = candidates.map((c) => [
    formId,
    c.name,
    c.email,
    c.mobile,
    c.degree,
    c.department,
    c.degree_percentage,
    c.sslc_percentage,
    c.hsc_percentage,
    c.location,
    c.relocate,
  ]);

  connection.query(insertQuery, [values], (err, result) => {
    if (err) {
      console.error("Error inserting candidates:", err);
      return res
        .status(SERVER_ERROR)
        .json({ message: "Failed to insert candidates", error: err });
    }

    res.status(STATUS_OK).json({
      message: "Candidates inserted successfully",
      insertedCount: result.affectedRows,
    });
  });
};

export const deleteSelectedCandidateByEmail = (req, res) => {
  const { formId, email } = req.params;

  if (!formId || !email) {
    return res
      .status(BAD_REQUEST)
      .json({ message: "formId and email are required" });
  }

  const sanitizedFormId = formId.replace(/[^a-zA-Z0-9_]/g, "_");
  const tableName = `selectedCandidate_${sanitizedFormId}`;

  const deleteQuery = `DELETE FROM \`${tableName}\` WHERE email = ?`;

  connection.query(deleteQuery, [email], (err, result) => {
    if (err) {
      console.error("Error deleting candidate:", err);
      return res
        .status(SERVER_ERROR)
        .json({ message: "Failed to delete candidate", error: err });
    }

    res.status(STATUS_OK).json({
      message: "Candidate deleted successfully",
      affectedRows: result.affectedRows,
    });
  });
};

export const getSelectedCandidatesByFormId = (req, res) => {
  const { formId } = req.params;

  if (!formId) {
    return res.status(BAD_REQUEST).json({ message: "formId is required" });
  }

  const sanitizedFormId = formId.replace(/[^a-zA-Z0-9_]/g, "_");
  const tableName = `selectedCandidate_${sanitizedFormId}`;

  const selectQuery = `SELECT * FROM \`${tableName}\``;

  connection.query(selectQuery, (err, results) => {
    if (err) {
      console.error("Error fetching candidates:", err);
      return res
        .status(SERVER_ERROR)
        .json({ message: "Failed to fetch candidates", error: err });
    }

    res.status(STATUS_OK).json({
      candidates: results,
    });
  });
};

export const updateForm = (req, res) => {
  const { formId } = req.params;
  const { label, description, startContent, endContent, duration, status } =
    req.body;

  if (!label) {
    return res.status(BAD_REQUEST).json({ message: "Label is required" });
  }

  connection.query(
    `UPDATE FormTable
       SET label = ?, description = ?, startContent = ?, endContent = ?, duration = ?, status = ?
       WHERE formId = ?`,
    [
      label,
      description || null,
      startContent || null,
      endContent || null,
      duration,
      status,
      formId,
    ],
    (err, results) => {
      if (err) {
        console.error("Error updating form:", err);
        return res.status(SERVER_ERROR).json({ error: "Server error" });
      }

      if (results.affectedRows === 0) {
        return res.status(NOT_FOUND).json({ message: "Form not found" });
      }

      res.status(STATUS_OK).json({ message: "Form updated successfully" });
    }
  );
};

export const deleteForm = (req, res) => {
  const { formId } = req.params;

  if (!formId) {
    return res.status(BAD_REQUEST).json({ message: "formId is required" });
  }

  const sanitizedFormId = formId.replace(/[^a-zA-Z0-9_]/g, "_");
  const candidateTable = `selectedCandidate_${sanitizedFormId}`;
  const valueTable = `valueTable_${sanitizedFormId}`;

  const dropCandidateTableQuery = `DROP TABLE IF EXISTS \`${candidateTable}\``;
  const dropValueTableQuery = `DROP TABLE IF EXISTS \`${valueTable}\``;

  connection.query(dropCandidateTableQuery, (dropErr1) => {
    if (dropErr1) {
      console.error("Error dropping candidate table:", dropErr1);
      return res
        .status(SERVER_ERROR)
        .json({ error: "Failed to drop candidate table" });
    }

    connection.query(dropValueTableQuery, (dropErr2) => {
      if (dropErr2) {
        console.error("Error dropping value table:", dropErr2);
        return res
          .status(SERVER_ERROR)
          .json({ error: "Failed to drop value table" });
      }

      const deleteFormQuery = `DELETE FROM FormTable WHERE formId = ?`;

      connection.query(deleteFormQuery, [formId], (deleteErr, results) => {
        if (deleteErr) {
          console.error("Error deleting form:", deleteErr);
          return res.status(SERVER_ERROR).json({ error: "Server error" });
        }

        if (results.affectedRows === 0) {
          return res.status(NOT_FOUND).json({ message: "Form not found" });
        }

        res.status(STATUS_OK).json({
          message:
            "Form, candidate table, and value table deleted successfully",
        });
      });
    });
  });
};

export const getSubmissions = (req, res) => {
  const { formId } = req.params;

  if (!formId) {
    return res.status(BAD_REQUEST).json({ message: "formId is required" });
  }

  const sanitizedFormId = formId.replace(/[^a-zA-Z0-9_]/g, "_");
  const tableName = `valueTable_${sanitizedFormId}`;

  const query = `SELECT * FROM \`${tableName}\``;

  connection.query(query, [formId], (err, results) => {
    if (err) {
      console.error("Error fetching submissions:", err);
      return res.status(SERVER_ERROR).json({ error: "Server error" });
    }

    res.status(STATUS_OK).json(results);
  });
};

export const editSubmission = (req, res) => {
  const { formId } = req.params;
  const { value, userEmail, endTime, duration, score, status, warnings } =
    req.body;

  if (!formId) {
    return res.status(BAD_REQUEST).json({ message: "formId is required" });
  }

  const sanitizedFormId = formId.replace(/[^a-zA-Z0-9_]/g, "_");
  const tableName = `valueTable_${sanitizedFormId}`;

  const query = `
    UPDATE \`${tableName}\`
    SET value = ?, endTime = ?, duration = ?, score = ?, status = ?, warnings = ?
    WHERE formId = ? AND userEmail = ?
  `;

  connection.query(
    query,
    [
      JSON.stringify(value),
      endTime || null,
      duration || null,
      score,
      status,
      warnings,
      formId,
      userEmail,
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating submission:", err);
        return res.status(SERVER_ERROR).json({ message: "Server error" });
      }

      if (result.affectedRows === 0) {
        return res.status(NOT_FOUND).json({ message: "Submission not found" });
      }

      res.status(STATUS_OK).json({ message: "Submission updated" });
    }
  );
};

export const getSubmittedCount = (req, res) => {
  const { formId } = req.params;

  if (!formId) {
    return res.status(BAD_REQUEST).json({ message: "formId is required" });
  }

  const sanitizedFormId = formId.replace(/[^a-zA-Z0-9_]/g, "_");
  const tableName = `valueTable_${sanitizedFormId}`;

  const query = `
    SELECT COUNT(*) AS submittedCount
    FROM \`${tableName}\`
    WHERE status = 'submitted'
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching submitted count:", err);
      return res.status(SERVER_ERROR).json({ error: "Server error" });
    }

    const submittedCount = results[0]?.submittedCount || 0;
    res.status(STATUS_OK).json({ submittedCount });
  });
};

export const replaceFields = (req, res) => {
  const { formId } = req.params;
  const fields = req.body.fields;

  if (!formId || !Array.isArray(fields)) {
    return res.status(BAD_REQUEST).json({
      message: "formId and an array of fields are required",
    });
  }

  connection.beginTransaction((err) => {
    if (err) {
      console.error("Transaction start error:", err);
      return res.status(SERVER_ERROR).json({ error: "Server error" });
    }

    connection.query(
      "DELETE FROM FieldTable WHERE formId = ?",
      [formId],
      (deleteErr) => {
        if (deleteErr) {
          return connection.rollback(() => {
            console.error("Delete error:", deleteErr);
            res
              .status(SERVER_ERROR)
              .json({ error: "Server error during delete" });
          });
        }

        const insertQuery = `
            INSERT INTO FieldTable
            (fieldId, formId, type, label, placeholder, options, rta)
            VALUES ?
          `;

        const values = fields.map((field) => [
          field.fieldId,
          formId,
          field.type || null,
          field.label || null,
          field.placeholder || null,
          JSON.stringify(field.options || null),
          JSON.stringify(field.rta || null),
        ]);

        connection.query(insertQuery, [values], (insertErr) => {
          if (insertErr) {
            return connection.rollback(() => {
              console.error("Insert error:", insertErr);
              res
                .status(SERVER_ERROR)
                .json({ error: "Server error during insert" });
            });
          }

          connection.commit((commitErr) => {
            if (commitErr) {
              return connection.rollback(() => {
                console.error("Commit error:", commitErr);
                res
                  .status(SERVER_ERROR)
                  .json({ error: "Server error during commit" });
              });
            }

            res
              .status(STATUS_OK)
              .json({ message: "Fields replaced successfully" });
          });
        });
      }
    );
  });
};

export const addForm = (req, res) => {
  const {
    formId,
    branch,
    label,
    description,
    manager,
    status = "inactive",
  } = req.body;

  const insertQuery = `
    INSERT INTO registration_form (formId, branch, label, description, manager, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    insertQuery,
    [formId, branch, label, description, manager, status],
    (err, results) => {
      if (err) {
        console.error("Add form error:", err);
        return res.status(SERVER_ERROR).json({ error: "Database error" });
      }

      const sanitizedFormId = formId.replace(/[^a-zA-Z0-9_]/g, "_");
      const registrationTable = `Registration_${sanitizedFormId}`;
      const selectedTable = `selected_${sanitizedFormId}`;

      const createTableSQL = (tableName) => `
        CREATE TABLE IF NOT EXISTS \`${tableName}\` (
          id INT AUTO_INCREMENT PRIMARY KEY,
          formId VARCHAR(36) NOT NULL,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          mobile VARCHAR(15) UNIQUE NOT NULL,
          degree VARCHAR(50) NOT NULL,
          department VARCHAR(50) NOT NULL,
          degree_percentage DECIMAL(5,2) NOT NULL,
          sslc_percentage DECIMAL(5,2) NOT NULL,
          hsc_percentage DECIMAL(5,2) NOT NULL,
          location VARCHAR(100) NOT NULL,
          relocate VARCHAR(100) NOT NULL,
          FOREIGN KEY (formId) REFERENCES registration_form(formId) ON DELETE CASCADE
        )
      `;

      connection.query(createTableSQL(registrationTable), (err2) => {
        if (err2) {
          console.error("Error creating registration table:", err2);
          return res
            .status(SERVER_ERROR)
            .json({ error: "Failed to create registration table" });
        }

        connection.query(createTableSQL(selectedTable), (err3) => {
          if (err3) {
            console.error("Error creating selected table:", err3);
            return res
              .status(SERVER_ERROR)
              .json({ error: "Failed to create selected table" });
          }

          res.status(STATUS_OK).json({
            message: "Form and related tables created successfully",
            formId,
          });
        });
      });
    }
  );
};

export const editForm = (req, res) => {
  const { formId } = req.params;
  const { branch, label, description, manager, status } = req.body;

  const query = `
    UPDATE registration_form
    SET branch = ?, label = ?, description = ?, manager = ?, status = ?
    WHERE formId = ?
  `;

  connection.query(
    query,
    [branch, label, description, manager, status, formId],
    (err, results) => {
      if (err) {
        console.error("Update form error:", err);
        return res.status(SERVER_ERROR).json({ error: "Database error" });
      }

      res.status(STATUS_OK).json({ message: "Form updated" });
    }
  );
};

export const removeForm = (req, res) => {
  const { formId } = req.params;

  const sanitizedFormId = formId.replace(/[^a-zA-Z0-9_]/g, "_");
  const registrationTable = `Registration_${sanitizedFormId}`;
  const selectedTable = `selected_${sanitizedFormId}`;

  const query = `DELETE FROM registration_form WHERE formId = ?`;

  connection.query(query, [formId], (err, results) => {
    if (err) {
      console.error("Delete form error:", err);
      return res.status(SERVER_ERROR).json({ error: "Database error" });
    }

    const dropRegistrationTableQuery = `DROP TABLE IF EXISTS \`${registrationTable}\``;
    const dropSelectedTableQuery = `DROP TABLE IF EXISTS \`${selectedTable}\``;

    connection.query(dropRegistrationTableQuery, (err) => {
      if (err) {
        console.error("Error dropping registration table:", err);
        return res
          .status(SERVER_ERROR)
          .json({ error: "Failed to drop registration table" });
      }

      connection.query(dropSelectedTableQuery, (err) => {
        if (err) {
          console.error("Error dropping selected table:", err);
          return res
            .status(SERVER_ERROR)
            .json({ error: "Failed to drop selected table" });
        }

        res
          .status(STATUS_OK)
          .json({ message: "Form and related tables deleted successfully" });
      });
    });
  });
};

export const getAllRegistrationForms = (req, res) => {
  const query = "SELECT * FROM registration_form";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching forms:", err);
      return res.status(SERVER_ERROR).json({ error: "Database error" });
    }

    res.status(STATUS_OK).json(results);
  });
};

export const getRegistrationForm = (req, res) => {
  const { formId } = req.params;
  const query = "SELECT * FROM registration_form WHERE formId = ?";

  connection.query(query, [formId], (err, results) => {
    if (err) {
      console.error("Error fetching forms:", err);
      return res.status(SERVER_ERROR).json({ error: "Database error" });
    }

    res.status(STATUS_OK).json(results[0]);
  });
};

export const uploadImageController = async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(BAD_REQUEST).send({ message: "No file uploaded." });
  }

  const imageUrl = await uploadImageToCloudinary(file.buffer);
  res.send({ imageUrl });
};

export const insertCandidates = (req, res) => {
  const { formId, tableType, candidates } = req.body;

  if (!formId || !tableType || !Array.isArray(candidates)) {
    return res
      .status(BAD_REQUEST)
      .json({ error: "Missing formId, tableType or candidates array" });
  }

  const sanitizedFormId = formId.replace(/[^a-zA-Z0-9_]/g, "_");
  const tableName = `${tableType}_${sanitizedFormId}`;

  const insertQuery = `
    INSERT INTO \`${tableName}\` 
    (formId, name, email, mobile, degree, department, degree_percentage, sslc_percentage, hsc_percentage, location, relocate)
    VALUES ?
  `;

  const values = candidates.map((c) => [
    formId,
    c.name,
    c.email,
    c.mobile,
    c.degree,
    c.department,
    c.degree_percentage,
    c.sslc_percentage,
    c.hsc_percentage,
    c.location,
    c.relocate,
  ]);

  connection.query(insertQuery, [values], (err, results) => {
    if (err) {
      console.error("Insert error:", err);
      return res.status(SERVER_ERROR).json({ error: "Database insert failed" });
    }

    res.status(STATUS_OK).json({ message: "Candidates inserted successfully" });
  });
};

export const deleteCandidate = (req, res) => {
  const { formId, tableType, email } = req.body;

  if (!formId || !tableType || !email) {
    return res
      .status(BAD_REQUEST)
      .json({ error: "Missing formId, tableType, or email" });
  }

  const sanitizedFormId = formId.replace(/[^a-zA-Z0-9_]/g, "_");
  const tableName = `${tableType}_${sanitizedFormId}`;

  const deleteQuery = `
    DELETE FROM \`${tableName}\`
    WHERE formId = ? AND email = ?
  `;

  connection.query(deleteQuery, [formId, email], (err, result) => {
    if (err) {
      console.error("Delete error:", err);
      return res
        .status(SERVER_ERROR)
        .json({ error: "Failed to delete candidate" });
    }

    if (result.affectedRows === 0) {
      return res
        .status(NOT_FOUND)
        .json({ message: "No candidate found with the provided email" });
    }

    res.status(STATUS_OK).json({ message: "Candidate deleted successfully" });
  });
};

export const getCandidates = (req, res) => {
  const { formId, tableType } = req.params;

  if (!formId || !tableType) {
    return res
      .status(BAD_REQUEST)
      .json({ error: "Missing formId or tableType" });
  }

  const sanitizedFormId = formId.replace(/[^a-zA-Z0-9_]/g, "_");
  const tableName = `${tableType}_${sanitizedFormId}`;

  const selectQuery = `
    SELECT id, formId, name, email, mobile, degree, department,
           degree_percentage, sslc_percentage, hsc_percentage,
           location, relocate
    FROM \`${tableName}\`
  `;

  connection.query(selectQuery, (err, results) => {
    if (err) {
      console.error("Error fetching candidates:", err);
      return res
        .status(SERVER_ERROR)
        .json({ error: "Failed to fetch candidates" });
    }

    res.status(STATUS_OK).json({ candidates: results });
  });
};

export const getCandidateCount = (req, res) => {
  const { formId, tableType } = req.params;

  if (!formId || !tableType) {
    return res
      .status(BAD_REQUEST)
      .json({ error: "Missing formId or tableType" });
  }

  const sanitizedFormId = formId.replace(/[^a-zA-Z0-9_]/g, "_");
  const tableName = `${tableType}_${sanitizedFormId}`;

  const countQuery = `SELECT COUNT(*) AS count FROM \`${tableName}\``;

  connection.query(countQuery, (err, results) => {
    if (err) {
      console.error("Error fetching candidate count:", err);
      return res
        .status(SERVER_ERROR)
        .json({ error: "Failed to fetch candidate count" });
    }

    res.status(STATUS_OK).json({ count: results[0].count });
  });
};
