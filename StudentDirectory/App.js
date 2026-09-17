import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator
} from "react-native";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";

export default function App() {
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Retrieve records from Firestore
  const fetchStudents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "students"));
      const list = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(list);
    } catch (error) {
      Alert.alert("Error", "Could not fetch student records.");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Save record with input validation
  const handleSaveStudent = async () => {
    if (!name.trim() || !course.trim()) {
      Alert.alert("Validation Error", "Please fill in both Name and Course.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "students"), {
        name: name.trim(),
        course: course.trim(),
        createdAt: new Date()
      });

      Alert.alert("Success", "Student record saved to Cloud Firestore!");
      setName("");
      setCourse("");
      fetchStudents();
    } catch (error) {
      Alert.alert("Error", "Failed to save record to cloud.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cloud Student Directory</Text>

      {/* Input Form */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Student Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Course / Program"
          value={course}
          onChangeText={setCourse}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleSaveStudent}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>SAVE STUDENT</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Display List using FlatList */}
      <Text style={styles.subtitle}>Enrolled Students</Text>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardName}>{item.name}</Text>
            <Text style={styles.cardCourse}>{item.course}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No student records found in cloud.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: "#f4f6f8" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: "#1a237e" },
  form: { backgroundColor: "#fff", padding: 15, borderRadius: 8, marginBottom: 20, elevation: 2 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 10, marginBottom: 12 },
  button: { backgroundColor: "#1a237e", padding: 12, borderRadius: 5, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  subtitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  card: { backgroundColor: "#fff", padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: "#e0e0e0" },
  cardName: { fontSize: 16, fontWeight: "bold" },
  cardCourse: { fontSize: 14, color: "#666" },
  emptyText: { textAlign: "center", color: "#888", marginTop: 20 }
});