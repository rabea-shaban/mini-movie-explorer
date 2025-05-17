import {
  Backdrop,
  Box,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Fade,
  Grid,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  overview: string;
  vote_average: number;
}

interface MoviesResponse {
  results: Movie[];
}

const API_KEY = "2b83cdba36d6f516ced1a9800c90852b";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const fetchMovies = async (query: string): Promise<MoviesResponse> => {
  if (!query) return { results: [] };
  const res = await axios.get(
    `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`
  );
  return res.data;
};

export default function App() {
  const [search, setSearch] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["movies", search],
    queryFn: () => fetchMovies(search),
    enabled: !!search,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <Box sx={{ padding: 4, maxWidth: 1200, margin: "auto" }}>
      <TextField
        label="ابحث عن فيلم"
        variant="outlined"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" mt={4}>
          حدث خطأ أثناء جلب البيانات.
        </Typography>
      )}

      <Grid container spacing={3} mt={2}>
        <AnimatePresence>
          {data?.results.map((movie) => (
            <Grid  key={movie.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  onClick={() => setSelectedMovie(movie)}
                  sx={{ cursor: "pointer", height: "100%" }}
                >
                  <CardMedia
                    component="img"
                    height="300"
                    image={
                      movie.poster_path
                        ? IMAGE_BASE_URL + movie.poster_path
                        : "https://via.placeholder.com/500x750?text=No+Image"
                    }
                    alt={movie.title}
                  />
                  <CardContent>
                    <Typography variant="h6" noWrap>
                      {movie.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {movie.release_date
                        ? new Date(movie.release_date).getFullYear()
                        : "غير معروف"}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </AnimatePresence>
      </Grid>

      <Modal
        open={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 500 } }}
      >
        <Fade in={!!selectedMovie}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "90%", sm: 600 },
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
              outline: "none",
            }}
          >
            {selectedMovie && (
              <>
                <Typography variant="h5" mb={2}>
                  {selectedMovie.title}
                </Typography>
                <Typography variant="body1" mb={2}>
                  {selectedMovie.overview || "لا يوجد وصف متاح"}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  <strong>التقييم:</strong> {selectedMovie.vote_average} / 10
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>تاريخ الإصدار:</strong>{" "}
                  {selectedMovie.release_date || "غير معروف"}
                </Typography>
              </>
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}
